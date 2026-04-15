import { inject, Injectable, signal, computed } from "@angular/core";
import { ProductoService } from "../services-backend/productos.ServiceBackend";
import { CategoriaService } from "../services-backend/categorias.ServiceBackend";
import { Producto } from "../models/producto.model";
import { forkJoin } from "rxjs";
import { CategoriaVendedor } from "../models/categoriaVendedor.model";
import { Catalogo } from "../models/catalogo.model";
import { CatalogoService } from "../services-backend/catalogo.ServiceBackend";

@Injectable({ providedIn: 'root' })
export class AdminStoreService {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private catalogoService = inject(CatalogoService);

  catalogo = signal<Catalogo | null>(null);
  categorias = signal<CategoriaVendedor[]>([]);
  productos = signal<Producto[]>([]);
  
  cargado = signal(false);

  catalogoId = computed(() => this.catalogo()?.id ?? 0);

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
    if (this.cargado()) return;
    forkJoin({
      prods: this.productoService.getProductosByCatalogo(catalogoId),
      cats: this.categoriaService.getCategoriasByCatalogo(catalogoId)
    }).subscribe({
      next: ({ prods, cats }) => {
        this.catalogo.set({ id: catalogoId } as any);
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