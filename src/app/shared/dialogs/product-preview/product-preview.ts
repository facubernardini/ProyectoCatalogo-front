import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { ProductPreviewService } from '@shared/services/product-preview.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ProductoManagerService } from 'src/app/core/services/producto-manager.service';
import { SafeHtmlPipe } from "../../../core/pipes/safe-html.pipe";
import { DisableNumberScrollDirective } from 'src/app/core/directives/disable-number-scroll.directive';

@Component({
  selector: 'app-product-preview',
  imports: [DisableNumberScrollDirective, SwipeDownDirective, FormsModule, Icon, SafeHtmlPipe],
  templateUrl: './product-preview.html',
  styleUrl: './product-preview.css',
})
export class ProductPreview {
  public productPreviewService = inject(ProductPreviewService);
  public productoManager = inject(ProductoManagerService);
  
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  @ViewChild('presentacionesContainer') presentacionesContainer!: ElementRef;

  agregarPresentacion(producto: Producto) {
    if (!producto.presentaciones) {
      producto.presentaciones = [];
    }
    producto.presentaciones.push({
      id: 0,
      producto_id: producto.id,
      unidad_venta: '',
      precio: null as any,
      precio_costo: null,
      precio_descuento: null,
      stock: null,
      activo: true
    });

    setTimeout(() => {
      if (this.presentacionesContainer) {
        const contenedor = this.presentacionesContainer.nativeElement;
        contenedor.scrollTo({
          top: contenedor.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 50);
  }

  // --- PAUSAR / REANUDAR CON AUTO-GUARDADO ---
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

  // --- ELIMINAR CON AUTO-GUARDADO ---
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
    
    return producto.presentaciones.some(p => {
      // 1. Unidad vacía
      if (!p.unidad_venta || p.unidad_venta.toString().trim() === '') return true;
      
      // 2. Precio vacío o <= 0
      if (p.precio === null || p.precio === undefined || p.precio.toString().trim() === '' || Number(p.precio) <= 0) return true;

      if (p.precio_costo && (p.precio_costo > p.precio)) return true;
      
      // 3. Descuento inválido (mayor o igual al precio)
      const descuentoInvalido = p.precio_descuento !== null && p.precio_descuento !== undefined && p.precio_descuento !== '' as any && Number(p.precio_descuento) >= Number(p.precio);
      if (descuentoInvalido) return true;

      return false;
    });
  }

  onGuardar(prod: Producto) {
    this.productPreviewService.onGuardar(prod);
  }
}