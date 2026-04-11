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

  nombreCliente = signal<string>('');
  direccionEnvio = signal<string>('');

  public cartService = inject(CartService);

  metodoEntrega = signal<'envio' | 'retiro' | null>(null);

  montoFaltante = computed(() => {
    const minimo = Number(this.catalogo()?.minimo_compra ?? 0);
    const total = this.cartService.totalPrice();
    return Math.max(0, minimo - total);
  });

  puedeFinalizar = computed(() => {
    const tieneItems = this.cartService.totalItems() > 0;
    const cumpleMinimo = this.cartService.totalPrice() >= (this.catalogo()?.minimo_compra ?? 0);
    const tieneEntrega = this.metodoEntrega() !== null;
    const tienePago = this.cartService.selectedPaymentMethod() !== null;

    const nombreValido = this.nombreCliente().trim().length > 3;
    const direccionValida = this.metodoEntrega() === 'envio' 
        ? this.direccionEnvio().trim().length > 5 
        : true;
    
    return tieneItems && cumpleMinimo && tieneEntrega && tienePago && nombreValido && direccionValida;
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
    const costoEnvio = Number(this.catalogo()?.costo_envio ?? 0);
    const pago = this.cartService.selectedPaymentMethod()?.nombre;
    
    let mensaje = `*Nuevo Pedido - ${this.catalogo()?.nombre_tienda}*\n\n`;
    mensaje += `*Cliente:* ${this.nombreCliente()}\n`;

    if (this.metodoEntrega() === 'envio') {
        mensaje += `*Dirección:* ${this.direccionEnvio()}\n`;
    }

    mensaje += `\n--------------------------\n`;
    
    items.forEach(item => {
      const subtotalItem = item.precio * item.cantidad;
      mensaje += `• ${item.cantidad}x ${item.nombre} (${item.unidad}): $${subtotalItem}\n`;
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

  getPorcentaje(base: number, oferta: number): number {
    if (!base || base <= 0) return 0;
    const ahorro = ((base - oferta) / base) * 100;
    return Math.round(ahorro);
  }

  seleccionarMetodo(metodo: 'envio' | 'retiro', element: HTMLElement) {
    this.metodoEntrega.set(metodo);
    
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
}
