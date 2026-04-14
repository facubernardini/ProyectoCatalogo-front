import { Injectable, inject, signal } from '@angular/core';
import { AdminStoreService } from './admin-store.service';
import { finalize } from 'rxjs';
import { ProductoService } from '../services-backend/productos.ServiceBackend';
import { Producto } from '../models/producto.model';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ProductFormService {
  private productoBackend = inject(ProductoService);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);

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
    const catalogoId = this.adminStore.catalogo()?.id;

    if (!catalogoId) {
      console.error('Error: No se pudo obtener el ID del catálogo');
      return;
    }

    this.loading.set(true);
    
    // 1. Capturamos el valor actual en una constante
    const currentProduct = this.editingProduct();

    const finalData = { 
      ...productData, 
      catalogo_id: catalogoId 
    };

    // 2. Ahora TypeScript sabe que si currentProduct existe, tiene un ID
    const request = currentProduct && currentProduct.id
      ? this.productoBackend.updateProducto(currentProduct.id, finalData)
      : this.productoBackend.createProducto(finalData);

    request.pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        if (currentProduct) { // Usamos la constante aquí también
          this.adminStore.updateProductoEnLista(res);
          this.toastService.show(`Producto guardado con éxito`);
        } else {
          this.adminStore.agregarProductoALista(res);
          this.toastService.show(`Producto creado con éxito`);
        }
        this.close();
      },
      error: (err) => console.error('Error:', err)
    });
	}

  delete(id: number) {
    if (confirm('¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer.')) {
      this.loading.set(true);
      
      this.productoBackend.deleteProducto(id).pipe(
        finalize(() => this.loading.set(false))
      ).subscribe({
        next: () => {
          this.adminStore.eliminarProductoDeLista(id);
          this.toastService.show(`Producto eliminado con éxito`);
          this.close();
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}