import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { ProductPreviewService } from '@shared/services/product-preview.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ProductoManagerService } from 'src/app/core/services/producto-manager.service';

@Component({
  selector: 'app-product-preview',
  imports: [SwipeDownDirective, FormsModule, Icon],
  templateUrl: './product-preview.html',
  styleUrl: './product-preview.css',
})
export class ProductPreview {
  public productPreviewService = inject(ProductPreviewService);
  public productoManager = inject(ProductoManagerService);
  
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  preciosInvalidos(producto: Producto): boolean {
    if (!producto || !producto.presentaciones) return false;
    
    return producto.presentaciones.some(p => 
      p.precio_descuento !== null && 
      p.precio_descuento !== undefined && 
      p.precio_descuento > 0 &&
      Number(p.precio_descuento) >= Number(p.precio)
    );
  }

  agregarPresentacion(producto: Producto) {
    if (!producto.presentaciones) {
      producto.presentaciones = [];
    }
    producto.presentaciones.push({
      id: 0,
      producto_id: producto.id,
      unidad_venta: '',
      precio: null as any,
      precio_descuento: null,
      stock: 0,
      activo: true
    });
  }

  onFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
  
  // Usamos requestAnimationFrame para asegurar que el DOM 
  // ya haya procesado el enfoque antes de mover el cursor
  requestAnimationFrame(() => {
    input.setSelectionRange(input.value.length, input.value.length);
  });
  }

  // --- NUEVO: PAUSAR / REANUDAR CON AUTO-GUARDADO ---
  async onToggleActivoPresentacion(producto: Producto, index: number) {
    const pres = producto.presentaciones[index];
    const estaActiva = pres.activo;
    const nombreVariante = pres.unidad_venta || 'esta variante';

    const confirmacion = await this.confirmService.ask({
      title: estaActiva ? '¿Pausar variante?' : '¿Reanudar variante?',
      message: estaActiva 
        ? `Tus clientes ya no podrán comprar "${nombreVariante}".` 
        : `La variante "${nombreVariante}" volverá a estar disponible para la venta.`,
      confirmText: estaActiva ? 'Pausar' : 'Reanudar',
      cancelText: 'Cancelar',
      icon: estaActiva ? 'pause' : 'play',
      type: estaActiva ? 'warning' : 'info'
    });

    if (confirmacion) {
      pres.activo = !estaActiva;
      this.productoManager.guardar(producto, producto);
    }
  }

  // --- ACTUALIZADO: ELIMINAR CON AUTO-GUARDADO ---
  async eliminarPresentacion(producto: Producto, index: number) {
    if (producto.presentaciones.length <= 1) {
      this.toastService.show('El producto debe tener al menos una variante.', 'error');
      return;
    }

    const presAEliminar = producto.presentaciones[index];
    const nombrePresentacion = presAEliminar.unidad_venta || 'Nueva presentación';

    const confirmacion = await this.confirmService.ask({
      title: '¿Eliminar presentación?',
      message: `Estás por borrar "${nombrePresentacion}" de "${producto.nombre}".`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Volver',
      icon: 'trash',
      type: 'danger'
    });

    if (confirmacion) {
      producto.presentaciones.splice(index, 1);
      
      this.productoManager.guardar(producto, producto);
    }
  }

  datosInvalidos(producto: Producto): boolean {
    if (!producto || !producto.presentaciones || producto.presentaciones.length === 0) return true;
    
    return producto.presentaciones.some(p => 
      !p.unidad_venta || p.unidad_venta.toString().trim() === '' ||
      p.precio === null || p.precio === undefined || p.precio.toString().trim() === '' || Number(p.precio) <= 0 ||
      (p.precio_descuento !== null && p.precio_descuento !== undefined && p.precio_descuento !== '' as any && Number(p.precio_descuento) > Number(p.precio))
    );
  }

  onGuardar(prod: Producto) {
    if (this.preciosInvalidos(prod)) return;
    this.productPreviewService.onGuardar(prod);
  }
}