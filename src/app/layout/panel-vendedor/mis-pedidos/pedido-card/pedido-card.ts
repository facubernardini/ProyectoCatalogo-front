import { trigger, transition, style, animate, state } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { EstadoPedido, PedidoDTO } from 'src/app/core/models/pedido.model';
import { PedidosServiceBackend } from 'src/app/core/services-backend/pedidos.ServiceBackend';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { Icon } from 'src/app/shared/components/icon';
import { MEDIO_PAGO_ICONS, MedioPago } from 'src/app/shared/enums/medio-pago.enum';
import { METODO_ENTREGA_ICONS, MetodoEntrega } from 'src/app/shared/enums/metodo-entrega.enum';
import { PedidoPreviewService } from 'src/app/shared/services/pedido-preview.service';

@Component({
  selector: 'app-pedido-card',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './pedido-card.html',
  styleUrl: './pedido-card.css',
  animations: [
    trigger('cardState', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(5px) scale(0.97)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      state('removing', style({
        opacity: 0, 
        transform: 'translateY(-5px) scale(0.95)', 
        height: 0, 
        margin: 0, 
        padding: 0 
      })),
      transition('* => removing', [
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class PedidoCard {
  private adminStore = inject(AdminStoreService);
  private pedidoServiceBackend = inject(PedidosServiceBackend);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  public pedidoPreviewService = inject(PedidoPreviewService);

  pedido = input.required<PedidoDTO>();

  estadoAnimacion = signal<'normal' | 'removing'>('normal');

  metodoEntregaEnum = MetodoEntrega;
  metodoEntregaIcons = METODO_ENTREGA_ICONS;
  medioPagoIcons = MEDIO_PAGO_ICONS;

  estadoPedido = EstadoPedido;

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

  contactarWhatsApp() {
    const telefono = this.pedido().comprador_telefono;
    if (!telefono) return;
    const numeroLimpio = telefono.replace(/\D/g, '');
    const url = `https://api.whatsapp.com/send?phone=549${numeroLimpio}`;
    window.open(url, '_blank');
  }

  abrirGoogleMaps() {
    let direccion = this.pedido().comprador_direccion;
    
    if (!direccion) return;

    const ciudadVendedor = this.adminStore.catalogo()?.ciudad || ''; 

    if (ciudadVendedor && !direccion.toLowerCase().includes(ciudadVendedor.toLowerCase())) {
      direccion = `${direccion}, ${ciudadVendedor}`;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    
    window.open(url, '_blank');
  }

  verDetalle() {
    this.pedidoPreviewService.open(this.pedido());
  }

  editarPedido() {
    this.pedidoPreviewService.open(this.pedido(), true);
  }

  async finalizarPedido() {
    const confirmacion = await this.confirmService.ask({
      title: '¿Marcar como entregado?',
      message: `El pedido #${this.pedido().numero_pedido} de ${this.pedido().comprador_nombre} pasará a estar finalizado.`,
      confirmText: 'Entregado',
      cancelText: 'Volver',
      icon: 'check',
      type: 'info'
    });

    if (confirmacion) {
      const proceso = this.toastService.loading('Actualizando...');
      this.pedidoServiceBackend.cambiarEstadoPedido(this.pedido().id, EstadoPedido.ENTREGADO).subscribe({
        next: (pedidoActualizado) => {
          this.animarYRemover(() => {
            this.adminStore.actualizarUnPedidoEnLista(pedidoActualizado);
          });
          proceso.success('Pedido entregado con éxito');
        },
        error: (err) => {
          console.error('Error al entregar pedido', err);
          proceso.error('Hubo un error al actualizar el pedido');
        }
      });
    }
  }

  async cancelarPedido() {
    const confirmacion = await this.confirmService.ask({
      title: '¿Cancelar pedido?',
      message: `El pedido de ${this.pedido().comprador_nombre} será cancelado definitivamente.`,
      confirmText: 'Sí, cancelar',
      cancelText: 'Volver',
      icon: 'close',
      type: 'danger'
    });

    if (confirmacion) {
      const proceso = this.toastService.loading('Cancelando pedido...');
      this.pedidoServiceBackend.cambiarEstadoPedido(this.pedido().id, EstadoPedido.CANCELADO).subscribe({
        next: () => {
          this.animarYRemover(() => {
            this.adminStore.removerPedidoDeLista(this.pedido().id);
          });
          proceso.success('Pedido cancelado');
        },
        error: (err) => {
          console.error('Error al cancelar pedido:', err);
          proceso.error('Error al cancelar el pedido');
        }
      });
    }
  }

  // Se ejecuta la animación de colapso, y una vez finalizada se actualiza la Store
  private animarYRemover(accionFinal: () => void) {
    this.estadoAnimacion.set('removing');
    setTimeout(() => {
      accionFinal();
    }, 200); 
  }
}