import { inject, Injectable, signal } from "@angular/core";
import { ProductoService } from "../services-backend/productos.service";
import { CategoriaService } from "../services-backend/categoriasVendedor.service";
import { Producto } from "../models/producto.model";
import { forkJoin } from "rxjs";
import { CategoriaVendedor } from "../models/categoriaVendedor.model";
import { Catalogo } from "../models/catalogo.model";

// admin-store.service.ts
@Injectable({ providedIn: 'root' })
export class AdminStoreService {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  productos = signal<Producto[]>([]);
  categorias = signal<CategoriaVendedor[]>([]);
  catalogo = signal<Catalogo | null>(null);

  cargado = signal(false);

  cargarDatosPanel(catalogoId: number) {
    if (this.cargado()) return; // Si ya cargamos, no hacemos nada

    // Podemos usar forkJoin para disparar ambas peticiones en paralelo
    forkJoin({
      prods: this.productoService.getProductosByCatalogo(catalogoId),
      cats: this.categoriaService.getCategoriasByCatalogo(catalogoId)
    }).subscribe({
      next: ({ prods, cats }) => {
        this.productos.set(prods);
        this.categorias.set(cats);
        this.cargado.set(true);
      },
      error: (err) => console.error('Error cargando el panel', err)
    });
  }

  agregarProductoALista(nuevo: any) {
		this.productos.update(list => [nuevo, ...list]);
	}

	updateProductoEnLista(editado: any) {
		this.productos.update(list => 
			list.map(p => p.id === editado.id ? editado : p)
		);
	}
}