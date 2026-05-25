import { inject, Injectable, signal } from '@angular/core';
import { AdminStoreService } from './admin-store.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { Producto } from '../models/producto.model';
import { finalize } from 'rxjs';
import { ProductoService } from '../services-backend/productos.ServiceBackend';

@Injectable({ providedIn: 'root' })
export class ProductoManagerService {
  private productoBackend = inject(ProductoService);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  public isLoading = signal(false);

  // --- ELIMINAR ---
  async eliminar(producto: Producto) {
    const confirmacion = await this.confirmService.ask({
      title: '¿Eliminar producto?',
      message: `¿Estás seguro de que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      icon: 'trash',
      type: 'danger'
    });

    if (!confirmacion) return;

    this.isLoading.set(true);
    this.productoBackend.deleteProducto(producto.id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.adminStore.eliminarProductoDeLista(producto.id);
        this.toastService.show('Producto eliminado definitivamente');
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.toastService.show('Hubo un error al intentar eliminar el producto', 'error');
      }
    });
  }

  // --- PAUSAR / REANUDAR ---
  async toggleActivo(producto: Producto) {
    const estaActivo = producto.activo;

    const confirmacion = await this.confirmService.ask({
      title: estaActivo ? '¿Pausar venta del producto?' : '¿Activar venta del producto?',
      message: estaActivo 
        ? 'Tus clientes no podrán ver ni comprar este producto hasta que lo actives de nuevo.' 
        : 'El producto volverá a estar visible para todos tus clientes.',
      confirmText: estaActivo ? 'Pausar' : 'Activar',
      cancelText: 'Volver',
      icon: estaActivo ? 'pause' : 'play',
      type: estaActivo ? 'warning' : 'info'
    });

    if (!confirmacion) return;

    this.isLoading.set(true);
    this.productoBackend.updateProducto(producto.id, { activo: !estaActivo }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (productoActualizado) => {
        this.adminStore.updateProductoEnLista(productoActualizado);
        this.toastService.show(estaActivo ? 'Producto pausado' : '¡Producto activado para la venta!');
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.toastService.show('No se pudo cambiar el estado del producto', 'error');
      }
    });
  }

  // --- DESTACAR ---
  async toggleDestacado(producto: Producto) {
    const esDestacado = producto.destacado;

    const confirmacion = await this.confirmService.ask({
      title: esDestacado ? '¿Quitar destacado?' : '¿Destacar producto?',
      message: esDestacado 
        ? 'El producto dejará de aparecer en la sección principal del catálogo.' 
        : 'Este producto aparecerá en los primeros lugares para tus clientes.',
      confirmText: esDestacado ? 'Quitar' : 'Destacar',
      cancelText: 'Volver',
      icon: 'star',
      type: esDestacado ? 'warning' : 'info'
    });

    if (!confirmacion) return;

    this.isLoading.set(true);
    this.productoBackend.updateProducto(producto.id, { destacado: !esDestacado }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (productoActualizado) => {
        this.adminStore.updateProductoEnLista(productoActualizado);
        this.toastService.show(esDestacado ? 'Se quitó de destacados' : '¡Producto destacado con éxito!');
      },
      error: (err) => {
        console.error('Error al actualizar destacado:', err);
        this.toastService.show('No se pudo actualizar el estado', 'error');
      }
    });
  }

  // --- DUPLICAR ---
  async duplicar(producto: Producto) {
    const confirmacion = await this.confirmService.ask({
      title: '¿Duplicar producto?',
      message: `Se creará una copia de "${producto.nombre}".`,
      confirmText: 'Duplicar',
      cancelText: 'Cancelar',
      icon: 'copy', 
      type: 'info'
    });

    if (!confirmacion) return;

    const catalogoId = this.adminStore.catalogo()?.id;
    if (!catalogoId) {
      this.toastService.show('Error: No se pudo obtener el ID del catálogo', 'error');
      return;
    }

    const { id, createdAt, updatedAt, presentaciones, categorias, tags, ...datosBase } = producto as any;

    const productoDuplicado = {
      ...datosBase,
      catalogo_id: catalogoId,
      nombre: `${producto.nombre} (Copia)`,
      destacado: false,
      activo: false,
      
      presentaciones: presentaciones?.map((p: any) => {
        const { id, producto_id, ...restoPres } = p;
        return restoPres;
      }) || [],
      
      categorias_ids: categorias?.map((c: any) => c.id) || [],
      tags_ids: tags?.map((t: any) => t.id) || []
    };

    this.isLoading.set(true);
    this.productoBackend.createProducto(productoDuplicado).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        this.adminStore.agregarProductoALista(res);
        this.adminStore.refrescarCategorias();
        this.toastService.show('¡Producto duplicado con éxito!');
      },
      error: (err) => {
        console.error('Error al duplicar:', err);
        this.toastService.show('Hubo un error al intentar duplicar el producto', 'error');
      }
    });
  }

  // --- CREAR O EDITAR ---
  guardar(productData: any, currentProduct?: Producto | null) {
    const catalogoId = this.adminStore.catalogo()?.id;

    if (!catalogoId) {
      console.error('Error: No se pudo obtener el ID del catálogo');
      return;
    }

    this.isLoading.set(true);
    
    const finalData = { 
      ...productData, 
      catalogo_id: catalogoId 
    };

    const request = currentProduct && currentProduct.id
      ? this.productoBackend.updateProducto(currentProduct.id, finalData)
      : this.productoBackend.createProducto(finalData);

    request.pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (currentProduct) {
          this.adminStore.updateProductoEnLista(res);
          this.toastService.show(`Producto actualizado`);
        } else {
          this.adminStore.agregarProductoALista(res);
          this.toastService.show(`Producto creado con éxito`);
        }
        this.adminStore.refrescarCategorias();
      },
      error: (err) => console.error('Error al guardar:', err)
    });
  }
}