import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Location } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductFormService } from 'src/app/core/services/product-form.service';
import { ProductPreviewService } from 'src/app/core/services/product-preview.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ProductoService } from 'src/app/core/services-backend/productos.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-mis-productos',
  imports: [Icon],
  templateUrl: './mis-productos.html',
  styleUrl: './mis-productos.css',
})
export class MisProductos {
  private adminStore = inject(AdminStoreService);
  private productoBackend = inject(ProductoService);
  private toastService = inject(ToastService);
  
  public productPreviewService = inject(ProductPreviewService);
  public confirmService = inject(ConfirmService);

  productos = this.adminStore.productos; 
  categorias = this.adminStore.categorias;

  categoriaSeleccionada = signal<string>('todos');
  activeMenuId = signal<number | null>(null);

  private location = inject(Location);
  productFormService = inject(ProductFormService);

  productosFiltrados = computed(() => {
    const seleccion = this.categoriaSeleccionada();
    const listaOriginal = this.adminStore.productos();

    if (seleccion === 'todos') {
      return listaOriginal;
    }

    return listaOriginal.filter(prod => 
      prod.categorias?.some(c => c.nombre === seleccion)
    );
  });

  categoriasOrdenadas = computed(() => {
    const lista = this.adminStore.categorias();
    
    return [...lista].sort((a, b) => {
      return Number(b.especial) - Number(a.especial);
    });
  });

  abrirFiltros() {
    throw new Error('Method not implemented.');
  }

  seleccionarCategoria(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
  }

  volverAtras() {
    this.location.back();
  }

  onAdd() {
    this.productFormService.openCreate();
  }

  onEdit(prod: Producto, event: Event) {
    event.stopPropagation();
    this.productFormService.openEdit(prod);
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
  }

  @HostListener('document:click')
  closeMenu() {
    this.activeMenuId.set(null);
  }

  async delete(producto: Producto) {
    const confirmacion = await this.confirmService.ask({
      title: '¿Eliminar producto?',
      message: `¿Estás seguro de que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      icon: 'trash',
      type: 'danger'
    });

    if (!confirmacion) return;

    this.productoBackend.deleteProducto(producto.id).subscribe({
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
  
  async onToggleStatus(producto: Producto) {
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

    this.productoBackend.updateProducto(producto.id, { activo: !estaActivo }).subscribe({
      next: (productoActualizado) => {
        this.adminStore.updateProductoEnLista(productoActualizado);
        
        this.toastService.show(
          estaActivo ? 'Producto pausado' : '¡Producto activado para la venta!'
        );
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.toastService.show('No se pudo cambiar el estado del producto', 'error');
      }
    });
  }

  async onDestacar(producto: Producto) {
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

    this.productoBackend.updateProducto(producto.id, { destacado: !esDestacado }).subscribe({
      next: (productoActualizado) => {
        this.adminStore.updateProductoEnLista(productoActualizado);
        
        this.toastService.show(
          esDestacado ? 'Se quitó de destacados' : '¡Producto destacado con éxito!'
        );
      },
      error: (err) => {
        console.error('Error al actualizar destacado:', err);
        this.toastService.show('No se pudo actualizar el estado', 'error');
      }
    });
  }
}
