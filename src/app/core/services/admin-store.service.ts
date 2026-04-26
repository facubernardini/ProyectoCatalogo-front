import { inject, Injectable, signal, computed } from "@angular/core";
import { ProductoService } from "../services-backend/productos.ServiceBackend";
import { CategoriaService } from "../services-backend/categorias.ServiceBackend";
import { Producto } from "../models/producto.model";
import { forkJoin } from "rxjs";
import { CategoriaVendedor } from "../models/categoriaVendedor.model";
import { Catalogo } from "../models/catalogo.model";
import { CatalogoService } from "../services-backend/catalogo.ServiceBackend";
import { AuthService } from "../services-backend/auth.ServiceBackend";

@Injectable({ providedIn: 'root' })
export class AdminStoreService {
  private authService = inject(AuthService);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private catalogoService = inject(CatalogoService);

  catalogo = signal<Catalogo | null>(null);
  categorias = signal<CategoriaVendedor[]>([]);
  productos = signal<Producto[]>([]);
  
  cargado = signal(false);

  catalogoId = computed(() => this.catalogo()?.id ?? 0);

  constructor() {
    const vendedorData = this.authService.getVendedorLocalStorage();
    if (vendedorData?.catalogo) {
      this.catalogo.set(vendedorData.catalogo);
    }
  }

  cargarDatosPublicos(slug: string) {
    this.cargado.set(false);
    
    forkJoin({
      catalogo: this.catalogoService.getCatalogoBySlug(slug),
      prods: this.productoService.getProductosBySlug(slug),
      cats: this.categoriaService.getCategoriasBySlug(slug) 
    }).subscribe({
      next: ({ catalogo, prods, cats }) => {
        this.catalogo.set(catalogo);
        this.productos.set(prods);
        this.categorias.set(cats);
        this.cargado.set(true);
      },
      error: (err) => console.error('Error cargando catálogo público', err)
    });
  }

  cargarDatosPanelVendedor(catalogoId: number) {
    this.cargado.set(false);
    
    forkJoin({
      catalogo: this.catalogoService.getCatalogoById(catalogoId),
      prods: this.productoService.getProductosByCatalogo(catalogoId),
      cats: this.categoriaService.getCategoriasByCatalogo(catalogoId)
    }).subscribe({
      next: ({ catalogo, prods, cats }) => {
        this.catalogo.set(catalogo);
        this.productos.set(prods);
        this.categorias.set(cats);
        this.cargado.set(true);
      },
      error: (err) => console.error('Error cargando el panel', err)
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
    this.productos.update(prods => prods.filter(p => p.id !== id));
  }

  moverProductosACategoria(catOrigenId: number, catDestinoId: number) {
    // Buscamos el objeto completo de la nueva categoría para asignarlo
    const nuevaCategoria = this.categorias().find(c => c.id === catDestinoId);
    if (!nuevaCategoria) return;

    this.productos.update(productos => productos.map(p => {
      // Verificamos si este producto tiene la categoría que estamos eliminando
      const tieneCategoriaVieja = p.categorias?.some(c => c.id === catOrigenId);
      
      if (tieneCategoriaVieja) {
        // Filtramos la categoría vieja
        const categoriasRestantes = p.categorias!.filter(c => c.id !== catOrigenId);
        
        // Añadimos la nueva categoría solo si no la tenía ya
        if (!categoriasRestantes.some(c => c.id === catDestinoId)) {
          categoriasRestantes.push(nuevaCategoria);
        }

        // Retornamos el producto actualizado
        return { ...p, categorias: categoriasRestantes };
      }
      
      // Si no estaba afectado, lo devolvemos igual
      return p;
    }));
  }

  eliminarProductosPorCategoria(categoriaId: number) {
    // Filtramos y quitamos de la lista los productos que SOLO tenían esta categoría
    this.productos.update(productos => productos.filter(p => 
      !(p.categorias?.length === 1 && p.categorias[0].id === categoriaId)
    ));
  }

  // --- MÉTODOS PARA CATEGORÍAS ---

  agregarCategoriaALista(nueva: CategoriaVendedor) {
    // Al agregar una nueva, forzamos que productos_count sea 0 para que no tire error el front
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
}