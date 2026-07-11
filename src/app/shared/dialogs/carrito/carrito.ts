import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, effect } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CartService } from '@shared/services/cart.service';
import { PedidoRealizadoService } from '@shared/services/pedido-realizado.service';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { SafeHtmlPipe } from 'src/app/core/pipes/safe-html.pipe';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [Icon, SwipeDownDirective, SafeHtmlPipe, CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  public adminStore = inject(AdminStoreService);
  public cartService = inject(CartService);
  private pedidoRealizadoService = inject(PedidoRealizadoService);
  private toastService = inject(ToastService);

  catalogo = this.adminStore.catalogo;

  nombreCliente = signal<string>('');
  direccionEnvio = signal<string>('');

  constructor() {
    effect(() => {
      const cat = this.catalogo();
      if (cat) {
        this.cartService.setCatalogConfig(
          Number(cat.costo_envio ?? 0),
          Number(cat.envio_gratis_desde ?? 0),
          Number(cat.descuento_en_efectivo),
        );
      }
    });
  }

  montoFaltante = computed(() => {
    const minimo = Number(this.catalogo()?.minimo_compra ?? 0);
    const precioProductos = this.cartService.priceAfterAllDiscounts();
    return Math.max(0, minimo - precioProductos);
  });

  puedeFinalizar = computed(() => {
    const tieneItems = this.cartService.totalItems() > 0;
    const cumpleMinimo = this.cartService.priceAfterAllDiscounts() >= (this.catalogo()?.minimo_compra ?? 0);
    
    const tieneEntrega = this.cartService.deliveryMethod() !== null;
    const tienePago = this.cartService.selectedPaymentMethod() !== null;
    const nombreValido = this.nombreCliente().trim().length > 3;
    
    const direccionValida = this.cartService.deliveryMethod() === 'envio' 
        ? this.direccionEnvio().trim().length > 5 
        : true;
    
    return tieneItems && cumpleMinimo && tieneEntrega && tienePago && nombreValido && direccionValida;
  });

  getPorcentaje(base: number, oferta: number): number {
    if (!base || base <= 0) return 0;
    return Math.round(((base - oferta) / base) * 100);
  }

  seleccionarMetodo(metodo: 'envio' | 'retiro', element: HTMLElement) {
    this.cartService.setDeliveryMethod(metodo);
    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  seleccionarPago(mp: any, element: HTMLElement) {
    this.cartService.selectPaymentMethod(mp);
    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  finalizarPedido() {
    if (this.cartService.totalItems() === 0) {
      this.toastService.show('El carrito está vacío', 'error');
      return;
    }

    if (this.cartService.priceAfterAllDiscounts() < (this.catalogo()?.minimo_compra ?? 0)) {
      this.toastService.show('No superaste el mínimo de compra', 'error');
      return;
    }

    if (!this.cartService.deliveryMethod()) {
      this.toastService.show('Seleccioná un método de entrega', 'error');
      document.getElementById('seccion-entrega')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!this.cartService.selectedPaymentMethod()) {
      this.toastService.show('Seleccioná un método de pago', 'error');
      document.getElementById('seccion-pago')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (this.nombreCliente().trim().length <= 3) {
      this.toastService.show('Ingresá tu nombre y apellido', 'error');
      document.getElementById('seccion-datos')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (this.cartService.deliveryMethod() === 'envio' && this.direccionEnvio().trim().length <= 5) {
      this.toastService.show('Ingresá la dirección de envío', 'error');
      document.getElementById('seccion-datos')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const items = this.cartService.items();
    const envio = this.cartService.deliveryMethod() === 'envio';
    const pago = this.cartService.selectedPaymentMethod()?.nombre;
    const cupon = this.cartService.appliedCupon();
    
    const descuentoEfectivo = this.cartService.cashDiscountAmount();
    const porcentajeEfectivo = this.cartService.catalogConfig()?.descuentoEfectivo;
    
    // --- CONSTRUCCIÓN DEL MENSAJE FORMAL ---
    
    const nombreTienda = this.catalogo()?.nombre_tienda?.toUpperCase() || 'TIENDA';
    let mensaje = `*NUEVO PEDIDO | ${nombreTienda}*\n\n`;

    // Sección 1: Cliente y Modalidad
    mensaje += `*1. Datos del Cliente*\n`;
    mensaje += `• Cliente: ${this.nombreCliente()}\n`;
    mensaje += `• Modalidad: ${envio ? 'Envío a domicilio' : 'Retiro por sucursal'}\n`;
    if (envio) {
      mensaje += `• Dirección: ${this.direccionEnvio()}\n`;
    }
    mensaje += `• Medio de pago: ${pago}\n\n`;

    // Sección 2: Detalle de compras
    mensaje += `*2. Detalle de Artículos*\n`;
    items.forEach(item => {
      const subtotalItem = item.precio * item.cantidad;
      mensaje += `• ${item.cantidad}x ${item.nombre} (${item.unidad}) — $${subtotalItem}\n`;
    });
    mensaje += `\n`;

    // Sección 3: Resumen de costos
    mensaje += `*3. Resumen de Cuenta*\n`;
    mensaje += `• Subtotal: $${this.cartService.subtotalPrice()}\n`;

    // Descuento por Cupón
    if (cupon) {
      mensaje += `• Cupón (${cupon.codigo}): -$${this.cartService.discountAmount()}\n`;
    }

    // Descuento por Efectivo
    if (descuentoEfectivo > 0 && porcentajeEfectivo) {
      mensaje += `• Descuento pago en efectivo (${porcentajeEfectivo}%): -$${descuentoEfectivo}\n`;
    }
    
    // Costo de Envío
    if (envio) {
      if (this.cartService.esEnvioGratis()) {
          mensaje += `• Costo de envío: Bonificado (Gratis)\n`;
      } else {
          mensaje += `• Costo de envío: $${this.catalogo()?.costo_envio}\n`;
      }
    }

    // Total final
    mensaje += `\n*TOTAL A ABONAR: $${this.cartService.totalFinal()}*\n\n`;
    
    mensaje += `Quedo a la espera de su confirmación. Muchas gracias.`;

    // --- FIN DEL MENSAJE ---

    const phone = this.catalogo()?.wpp_numero;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
    
    const metodo = this.cartService.deliveryMethod() || 'retiro';

    window.open(url, '_blank');

    this.cartService.limpiarCarrito(true);
    this.nombreCliente.set('');
    this.direccionEnvio.set('');
    this.cartService.close();

    setTimeout(() => {
      this.pedidoRealizadoService.open(metodo, url);
    }, 5000);
  }
}