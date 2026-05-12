import { inject, Injectable, signal } from '@angular/core';
import { Producto } from '../models/producto.model';
import { ProductoService } from '../services-backend/productos.ServiceBackend';
import { AdminStoreService } from './admin-store.service';
import { ToastService } from './toast.service';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductPreviewService {
  private productoBackend = inject(ProductoService);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  
  loading = signal(false);
  isOpen = signal(false);
  selectedProduct = signal<Producto | null>(null);

  open(producto: Producto) {
    const copiaProducto = structuredClone(producto);
    
    this.selectedProduct.set(copiaProducto);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.loading.set(false);
    this.selectedProduct.set(null);
    document.body.style.overflow = 'auto';
  }

  onGuardar(producto: Producto) {
    if (!producto || !producto.id) return;

    this.loading.set(true);

    const { categorias, tags, ...datosRestantes } = producto;

    const productoFormateado = {
      ...datosRestantes,
      presentaciones: producto.presentaciones.map(p => ({
        ...p,
        precio: Number(p.precio),
        precio_descuento: p.precio_descuento ? Number(p.precio_descuento) : null
      }))
    };

    this.productoBackend.updateProducto(producto.id, productoFormateado)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          this.adminStore.updateProductoEnLista(res);
          this.adminStore.refrescarCategorias();
          this.toastService.show('Precios actualizados');
          this.close();
        },
        error: (err) => {
          console.error('Error al actualizar el producto:', err);
        }
      });
  }
}