import { inject, Injectable, signal, computed } from "@angular/core";
import { ProductoService } from "../services-backend/productos.ServiceBackend";
import { CategoriaService } from "../services-backend/categorias.ServiceBackend";
import { Producto, Tag } from "../models/producto.model";
import { forkJoin } from "rxjs";
import { CategoriaVendedor } from "../models/categoriaVendedor.model";
import { Catalogo, MedioPago } from "../models/catalogo.model";
import { CatalogoService } from "../services-backend/catalogo.ServiceBackend";
import { Cupon } from "../models/cupon.model";
import { CuponServiceBackend } from "../services-backend/cupones.ServiceBackend";
import { MediosPagoServiceBackend } from "../services-backend/medios-pago.ServiceBackend";
import { TagService } from "../services-backend/tags.ServiceBackend";
import { VendedorBackoffice } from "../models/backoffice/vendedorBackoffice.model";
import { VendedorService } from "../services-backend/vendedores.ServiceBackend";
import { CatalogoBackoffice } from "../models/backoffice/catalogoBackoffice.mode";
import { HistorialSuscripcion, PlanSuscripcion, SuscripcionEstado } from "../models/backoffice/suscripcion.model";
import { SuscripcionesService } from "../services-backend/suscripciones.ServiceBackend";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { Vendedor } from "../models/vendedor.model";

declare var gtag: Function;

@Injectable({ providedIn: 'root' })
export class AdminStoreService {
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private catalogoService = inject(CatalogoService);
  private vendedorService = inject(VendedorService);
  private suscripcionService = inject(SuscripcionesService);
  private cuponService = inject(CuponServiceBackend);
  private mediosPagoService = inject(MediosPagoServiceBackend);
  private tagsService = inject(TagService);

  // PUBLIC & SELLER
  catalogo = signal<Catalogo | null>(null);
  categorias = signal<CategoriaVendedor[]>([]);
  productos = signal<Producto[]>([]);

  // ONLY SELLER
  vendedor = signal<Vendedor | null>(this.obtenerVendedorGuardado());
  cupones = signal<Cupon[]>([]);
  mediosPago = signal<MedioPago[]>([]);
  tags = signal<Tag[]>([]);

  // BACKOFFICE
  vendedoresBackoffice = signal<VendedorBackoffice[]>([]);
  catalogosBackoffice = signal<CatalogoBackoffice[]>([]);
  suscripcionesHistorialBackoffice = signal<HistorialSuscripcion[]>([]);
  planesSuscripcionBackoffice = signal<PlanSuscripcion[]>([]);
  
  public isLoading = signal(false);

  catalogoId = computed(() => this.catalogo()?.id ?? 0);
 
  private obtenerVendedorGuardado(): Vendedor | null {
    const data = localStorage.getItem('vendedor');
    if (data && data !== 'undefined' && data !== 'null') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  cargarDatosPublicos(slug: string) {
    this.isLoading.set(true);
    
    forkJoin({
      catalogo: this.catalogoService.getCatalogoBySlug(slug),
      productos: this.productoService.getProductosBySlug(slug),
      categorias: this.categoriaService.getCategoriasBySlug(slug) 
    }).subscribe({
      next: ({ catalogo, productos, categorias }) => {
        this.catalogo.set(catalogo);
        this.productos.set(productos);
        this.categorias.set(categorias);

        this.registrarVisita();
        
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        // Tienda suspendida
        if (err.status === 403 && err.error?.code === 'TIENDA_SUSPENDIDA') {
          this.router.navigate(['/not-found']);
        } else if (err.status === 404) {
          // La tienda no existe
          this.router.navigate(['/not-found']); 
        } else {
          // Error de servidor (500) o sin conexión
          this.router.navigate(['/404']);
        }
      }
    });
  }

  cargarDatosPanelVendedor(catalogoId: number) {
    this.isLoading.set(true);
    
    forkJoin({
      catalogo: this.catalogoService.getCatalogoById(catalogoId),
      productos: this.productoService.getProductosByCatalogo(catalogoId),
      categorias: this.categoriaService.getCategoriasByCatalogo(catalogoId),
      cupones: this.cuponService.getCuponesByCatalogo(catalogoId),
      mediosPago: this.mediosPagoService.getMediosDePago(),
      tags: this.tagsService.getTagsByCatalogo(catalogoId),
    }).subscribe({
      next: ({ catalogo, productos, categorias, cupones, mediosPago, tags }) => {
        this.catalogo.set(catalogo);
        this.productos.set(productos);
        this.categorias.set(categorias);
        this.cupones.set(cupones);
        this.mediosPago.set(mediosPago);
        this.tags.set(tags);

        this.isLoading.set(false);
      },
      error: (err) => console.error('Error cargando el panel', err)
    });
  }

  cargarDatosPanelBackoffice() {
    this.isLoading.set(true);
    
    forkJoin({
      vendedores: this.vendedorService.getVendedores(),
      catalogos: this.catalogoService.getCatalogos(),
      historialSuscripciones: this.suscripcionService.getHistorialSuscripciones(),
      planes: this.suscripcionService.getPlanes(),
    }).subscribe({
      next: ({ vendedores, catalogos, historialSuscripciones, planes }) => {
        this.vendedoresBackoffice.set(vendedores);
        this.catalogosBackoffice.set(catalogos);
        this.suscripcionesHistorialBackoffice.set(historialSuscripciones);
        this.planesSuscripcionBackoffice.set(planes);
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando el backoffice', err);
        this.isLoading.set(false);
      }
    });
  }

  refrescarCategorias() {
    const id = this.catalogoId();

    if (id > 0) {
      this.categoriaService.getCategoriasByCatalogo(id).subscribe({
        next: (cats) => this.categorias.set(cats),
        error: (err) => console.error('Error al refrescar categorías por ID', err)
      });
    }
  }

  refrescarDatosBackoffice() {
    this.isLoading.set(true);
    forkJoin({
      vendedores: this.vendedorService.getVendedores(),
      catalogos: this.catalogoService.getCatalogos(),
      historialSuscripciones: this.suscripcionService.getHistorialSuscripciones(),
      planes: this.suscripcionService.getPlanes(),
    }).subscribe({
      next: ({ vendedores, catalogos, historialSuscripciones, planes }) => {
        this.vendedoresBackoffice.set(vendedores);
        this.catalogosBackoffice.set(catalogos);
        this.suscripcionesHistorialBackoffice.set(historialSuscripciones);
        this.planesSuscripcionBackoffice.set(planes);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al refrescar el backoffice', err);
        this.isLoading.set(false);
      }
    });
  }

  private registrarVisita(): void {
    if (typeof gtag === 'function') {
      
      const hostname = window.location.hostname;
      const subdominio = hostname.split('.')[0];

      gtag('event', 'visita_tienda', {
        tienda_id: subdominio,
        origen: 'web'
      });
    }
  }

  // --- MÉTODOS PARA PRODUCTOS ---

  agregarProductoALista(nuevo: Producto) {
    this.productos.update(list => [nuevo, ...list]);
  }

  updateProductoEnLista(editado: Producto) {
    this.productos.update(list => 
      list.map(p => p.id === editado.id ? editado : p)
    );
  }

  eliminarProductoDeLista(id: number) {
    const productoAEliminar = this.productos().find(p => p.id === id);

    this.productos.update(prods => prods.filter(p => p.id !== id));

    if (productoAEliminar && productoAEliminar.categorias?.length) {
      const idsCategoriasAfectadas = productoAEliminar.categorias.map(c => c.id);

      this.categorias.update(categoriasActuales => 
        categoriasActuales.map(cat => {
          if (idsCategoriasAfectadas.includes(cat.id) && cat.productos_count > 0) {
            return { ...cat, productos_count: cat.productos_count - 1 };
          }
          return cat;
        })
      );
    }
  }

  moverProductosACategoria(catOrigenId: number, catDestinoId: number) {
    const nuevaCategoria = this.categorias().find(c => c.id === catDestinoId);
    if (!nuevaCategoria) return;

    let cantidadMovidos = 0;

    this.productos.update(productos => productos.map(p => {
      const tieneCategoriaVieja = p.categorias?.some(c => c.id === catOrigenId);
      
      if (tieneCategoriaVieja) {
        cantidadMovidos++;
        
        const categoriasActualizadas = p.categorias!.filter(c => c.id !== catOrigenId);
        categoriasActualizadas.push(nuevaCategoria);

        return { ...p, categorias: categoriasActualizadas };
      }
      
      return p;
    }));

    if (cantidadMovidos > 0) {
      this.categorias.update(categoriasActuales => 
        categoriasActuales.map(cat => 
          cat.id === catDestinoId 
            ? { ...cat, productos_count: (cat.productos_count || 0) + cantidadMovidos }
            : cat
        )
      );
    }
  }

  eliminarProductosPorCategoria(categoriaId: number) {
    this.productos.update(productos => {
      const productosSobrevivientes = productos.filter(p => 
        !(p.categorias?.length === 1 && p.categorias[0].id === categoriaId)
      );

      return productosSobrevivientes.map(p => {
        if (p.categorias?.some(c => c.id === categoriaId)) {
          return {
            ...p,
            categorias: p.categorias.filter(c => c.id !== categoriaId)
          };
        }
        
        return p; 
      });
    });
  }

  // --- MÉTODOS PARA CATEGORÍAS ---

  agregarCategoriaALista(nueva: CategoriaVendedor) {
    const nuevaConConteo = { ...nueva, productos_count: 0 };
    this.categorias.update(list => [...list, nuevaConConteo]);
  }

  updateCategoriaEnLista(editada: CategoriaVendedor) {
    this.categorias.update(list => 
      list.map(c => c.id === editada.id ? { ...c, ...editada } : c)
    );
  }

  eliminarCategoriaDeLista(id: number) {
    this.categorias.update(list => list.filter(c => c.id !== id));
  }

  // --- MÉTODOS PARA GESTIÓN DE CUPONES ---

  agregarCuponALista(nuevoCupon: Cupon) {
    this.cupones.update(cuponesActuales => {
      return [nuevoCupon, ...cuponesActuales];
    });
  }

  updateCuponEnLista(cuponActualizado: Cupon) {
    this.cupones.update(cuponesActuales => 
      cuponesActuales.map(cupon => 
        cupon.id === cuponActualizado.id ? cuponActualizado : cupon
      )
    );
  }

  eliminarCuponDeLista(idCupon: number) {
    this.cupones.update(cuponesActuales => 
      cuponesActuales.filter(cupon => cupon.id !== idCupon)
    );
  }

  // --- MÉTODOS PARA VENDEDORES (BACKOFFICE) ---

  updateVendedorEnLista(vendedorActualizado: Partial<VendedorBackoffice>) {
    this.vendedoresBackoffice.update(vendedores => 
      vendedores.map(vendedor => {
        if (vendedor.id !== vendedorActualizado.id) {
          return vendedor;
        }

        const vendedorModificado = { ...vendedor, ...vendedorActualizado } as VendedorBackoffice;

        if (vendedorActualizado.activo !== undefined && vendedor.suscripcion) {
          
          vendedorModificado.suscripcion = {
            ...vendedor.suscripcion,
            estado: vendedorActualizado.activo ? SuscripcionEstado.ACTIVA : SuscripcionEstado.CANCELADA
          } as any; 
        }

        return vendedorModificado;
      })
    );
  }
}