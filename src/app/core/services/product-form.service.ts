import { Injectable, inject, signal } from '@angular/core';
import { AdminStoreService } from './admin-store.service';
import { finalize } from 'rxjs';
import { ProductoService } from '../services-backend/productos.service';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductFormService {
  private productoBackend = inject(ProductoService);
  private adminStore = inject(AdminStoreService);

  // Estados de la UI
  isOpen = signal(false);
  loading = signal(false);
  
  // El producto que estamos editando (null si es creación)
  editingProduct = signal<Producto | null>(null);

  openCreate() {
    this.editingProduct.set(null);
    this.isOpen.set(true);
  }

  openEdit(producto: Producto) {
    this.editingProduct.set({ ...producto });
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.editingProduct.set(null);
  }

  save(productData: any) {
    this.loading.set(true);
    
    // 1. Capturamos el valor actual en una constante
    const currentProduct = this.editingProduct();

    // 2. Ahora TypeScript sabe que si currentProduct existe, tiene un ID
    const request = currentProduct
      ? this.productoBackend.updateProducto(currentProduct.id, productData)
      : this.productoBackend.createProducto(productData);

    request.pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        if (currentProduct) { // Usamos la constante aquí también
          this.adminStore.updateProductoEnLista(res);
        } else {
          this.adminStore.agregarProductoALista(res);
        }
        this.close();
      },
      error: (err) => console.error('Error:', err)
    });
	}
}