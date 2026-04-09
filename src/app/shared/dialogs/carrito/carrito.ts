import { Component, computed, inject, input, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { Catalogo } from 'src/app/core/models/catalogo.model';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-carrito',
  imports: [Icon, SwipeDownDirective],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  catalogo = input<Catalogo | null>(null);

  public cartService = inject(CartService);

  metodoEntrega = signal<'envio' | 'retiro'>('retiro');

  montoFaltante = computed(() => {
    const minimo = Number(this.catalogo()?.minimo_compra ?? 0);
    const total = this.cartService.totalPrice();
    return Math.max(0, minimo - total);
  });

  puedeFinalizar = computed(() => {
    const tieneItems = this.cartService.totalItems() > 0;
    const cumpleMinimo = this.cartService.totalPrice() >= (this.catalogo()?.minimo_compra ?? 0);
    const tienePago = this.cartService.selectedPaymentMethod() !== null; // <--- NUEVA REGLA
    
    return tieneItems && cumpleMinimo && tienePago;
  });

  totalFinal = computed(() => {
    const subtotal = this.cartService.totalPrice();
    const costoEnvio = Number(this.catalogo()?.costo_envio ?? 0);
    
    return this.metodoEntrega() === 'envio' 
      ? subtotal + costoEnvio 
      : subtotal;
  });

  finalizarPedido() {
    const items = this.cartService.items();
    const envio = this.metodoEntrega() === 'envio';
    const costoEnvio = this.catalogo()?.costo_envio ?? 0;
    const pago = this.cartService.selectedPaymentMethod()?.nombre;
    
    let mensaje = `*Nuevo Pedido - ${this.catalogo()?.nombre_tienda}*\n\n`;
    
    items.forEach(item => {
      mensaje += `• ${item.cantidad}x ${item.nombre} (${item.unidad}): $${item.precio * item.cantidad}\n`;
    });

    mensaje += `\n--------------------------`;
    mensaje += `\n*Subtotal:* $${this.cartService.totalPrice()}`;
    mensaje += `\n*Medio de Pago:* ${pago}`;
    
    if (envio) {
      mensaje += `\n*Envío:* $${costoEnvio}`;
      mensaje += `\n*Entrega:* Envío a domicilio`;
    } else {
      mensaje += `\n*Entrega:* Retiro en el local`;
    }

    mensaje += `\n*TOTAL FINAL: $${this.totalFinal()}*`;
    
    const phone = this.catalogo()?.wpp_numero;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
  }
}
