import { Component, computed, inject, signal, effect } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { SafeHtmlPipe } from 'src/app/core/pipes/safe-html.pipe';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [Icon, SwipeDownDirective, SafeHtmlPipe],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  public adminStore = inject(AdminStoreService);
  public cartService = inject(CartService);

  catalogo = this.adminStore.catalogo;

  nombreCliente = signal<string>('');
  direccionEnvio = signal<string>('');

  constructor() {
    effect(() => {
      const cat = this.catalogo();
      if (cat) {
        this.cartService.setCatalogConfig(
          Number(cat.costo_envio ?? 0),
          Number(cat.envio_gratis_desde ?? 0)
        );
      }
    });
  }

  // Comparamos el mínimo contra el precio de los productos (con descuento de cupón)
  montoFaltante = computed(() => {
    const minimo = Number(this.catalogo()?.minimo_compra ?? 0);
    const precioProductos = this.cartService.priceAfterDiscount();
    return Math.max(0, minimo - precioProductos);
  });

  puedeFinalizar = computed(() => {
    const tieneItems = this.cartService.totalItems() > 0;
    const cumpleMinimo = this.cartService.priceAfterDiscount() >= (this.catalogo()?.minimo_compra ?? 0);
    
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
    const items = this.cartService.items();
    const envio = this.cartService.deliveryMethod() === 'envio';
    const pago = this.cartService.selectedPaymentMethod()?.nombre;
    const cupon = this.cartService.appliedCupon();
    
    let mensaje = `*Nuevo Pedido - ${this.catalogo()?.nombre_tienda}*\n\n`;
    mensaje += `*Cliente:* ${this.nombreCliente()}\n`;

    if (envio) {
        mensaje += `*Dirección:* ${this.direccionEnvio()}\n`;
    }

    mensaje += `\n--------------------------\n`;
    
    items.forEach(item => {
      const subtotalItem = item.precio * item.cantidad;
      mensaje += `• ${item.cantidad}x ${item.nombre} (${item.unidad}): $${subtotalItem}\n`;
    });

    mensaje += `\n--------------------------`;
    mensaje += `\n*Subtotal:* $${this.cartService.subtotalPrice()}`;

    if (cupon) {
      mensaje += `\n*Cupón:* ${cupon.codigo} (-$${this.cartService.discountAmount()})`;
    }
    
    if (envio) {
      if (this.cartService.esEnvioGratis()) {
          mensaje += `\n*Envío:* Gratis (Bonificado)`;
      } else {
          mensaje += `\n*Envío:* $${this.catalogo()?.costo_envio}`;
      }
    }

    mensaje += `\n*Medio de Pago:* ${pago}`;
    mensaje += `\n*Entrega:* ${envio ? 'Envío a domicilio' : 'Retiro en el local'}`;

    mensaje += `\n\n*TOTAL FINAL: $${this.cartService.totalFinal()}*`;
    
    const phone = this.catalogo()?.wpp_numero;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
  }
}