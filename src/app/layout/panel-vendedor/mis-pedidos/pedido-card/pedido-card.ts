import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, input, Output, signal } from '@angular/core';
import { EstadoPago, PedidoDTO } from 'src/app/core/models/pedido.model';
import { Icon } from 'src/app/shared/components/icon';
import { MEDIO_PAGO_ICONS, MedioPago } from 'src/app/shared/enums/medio-pago.enum';
import { METODO_ENTREGA_ICONS, MetodoEntrega } from 'src/app/shared/enums/metodo-entrega.enum';

@Component({
  selector: 'app-pedido-card',
  imports: [CommonModule, Icon],
  templateUrl: './pedido-card.html',
  styleUrl: './pedido-card.css',
})
export class PedidoCard {
  pedido = input.required<PedidoDTO>();
  
  @Output() verDetalle = new EventEmitter<PedidoDTO>();

  isMenuOpen = signal<boolean>(false);
  estadoPago = EstadoPago;

  metodoEntregaIcons = METODO_ENTREGA_ICONS;
  medioPagoIcons = MEDIO_PAGO_ICONS;  

  cantidadArticulos = computed(() => {
    const p = this.pedido();
    if (!p?.productos) return 0;
    return p.productos.reduce((total, item) => total + item.cantidad, 0);
  });

  getIconoEntrega(metodo: string): string {
    return this.metodoEntregaIcons[metodo as MetodoEntrega] || 'shop';
  }

  getIconoPago(metodo: string): string {
    return this.medioPagoIcons[metodo as MedioPago] || 'wallet';
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  contactarWhatsApp() {
    console.log('Contactando por WA a:', this.pedido().comprador_nombre);
  }

  onVerDetalle() {
    this.verDetalle.emit(this.pedido());
  }

  onOpcion1() {
    this.closeMenu();
    console.log('Opción 1 clickeada');
  }

  onCancelarPedido() {
    this.closeMenu();
    console.log('Cancelar pedido clickeado');
  }
}
