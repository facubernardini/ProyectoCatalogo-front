import { trigger, transition, style, animate, state } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { EstadoPago, EstadoPedido, PedidoDTO } from 'src/app/core/models/pedido.model';
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

  isMenuOpen = signal<boolean>(false);
  estadoAnimacion = signal<'normal' | 'removing'>('normal');

  estadoPago = EstadoPago;
  metodoEntregaEnum = MetodoEntrega;

  metodoEntregaIcons = METODO_ENTREGA_ICONS;
  medioPagoIcons = MEDIO_PAGO_ICONS;  

  cantidadArticulos = computed(() => {
    const p = this.pedido();
    if (!p?.productos) return 0;
    return p.productos.reduce((total, item) => total + item.cantidad, 0);
  });

  getTextoBotonAvanzar(estadoActual: string): string {
    const mapaTextos: Record<string, string> = {
      [EstadoPedido.PENDIENTE]: 'Preparar',
      [EstadoPedido.EN_PREPARACION]: 'Pedido Listo',
      [EstadoPedido.LISTO_PARA_ENTREGAR]: 'Entregado'
    };
    return mapaTextos[estadoActual] || 'Avanzar';
  }

  getEstiloBotonAvanzar(estadoActual: string): string {
    const mapaColores: Record<string, string> = {
      [EstadoPedido.PENDIENTE]: 'bg-blue-500 hover:bg-blue-600 border-blue-600',
      [EstadoPedido.EN_PREPARACION]: 'bg-amber-500 hover:bg-amber-600 border-amber-600',
      [EstadoPedido.LISTO_PARA_ENTREGAR]: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600'
    };
    return mapaColores[estadoActual] || 'bg-brand-accent hover:bg-brand-accent/90';
  }

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
    const telefono = this.pedido().comprador_telefono;

    if (!telefono) {
      return;
    }

    const numeroLimpio = telefono.replace(/\D/g, '');

    const url = `https://api.whatsapp.com/send?phone=549${numeroLimpio}`;

    window.open(url, '_blank');
  }

  verDetalle() {
    this.pedidoPreviewService.open(this.pedido());
  }

  editarPedido() {
    this.closeMenu();

    if (this.pedido().estado === EstadoPedido.LISTO_PARA_ENTREGAR) {
      this.toastService.show('Los pedidos listos para entregar no se pueden editar', 'info');
      return;
    }

    this.pedidoPreviewService.open(this.pedido(), true);
  }

  async toggleEstadoPago() {
    this.closeMenu();

    const esPagado = this.pedido().estado_pago === EstadoPago.PAGADO;
    
    const nuevoEstado = esPagado ? EstadoPago.PENDIENTE : EstadoPago.PAGADO;

    const confirmacion = await this.confirmService.ask({
      title: esPagado ? '¿Marcar como impago?' : '¿Marcar como pagado?',
      message: esPagado 
        ? 'El pedido volverá a figurar como pendiente de pago.' 
        : 'El pedido se marcará como cobrado.',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      icon: esPagado ? 'no-payment' : 'payment-done',
      type: 'info'
    });

    if (confirmacion) {
      const proceso = this.toastService.loading('Actualizando pedido...');
      this.pedidoServiceBackend.cambiarEstadoPago(this.pedido().id, nuevoEstado).subscribe({
        next: (pedidoActualizado) => {
          this.adminStore.actualizarUnPedidoEnLista(pedidoActualizado);
          proceso.success(esPagado ? 'Marcado como impago' : 'Marcado como pagado');
        },
        error: (err) => {
          console.error('Error al cambiar el estado de pago', err);
          proceso.error('Error al actualizar el pago. Intenta de nuevo.');
        }
      });
    }
  }

  async avanzarEstado() {
    const estadoActual = this.pedido().estado;
    let nuevoEstado: EstadoPedido | null = null;
    let tituloDialog = '';
    let mensajeDialog = '';

    if (estadoActual === EstadoPedido.PENDIENTE) {
      nuevoEstado = EstadoPedido.EN_PREPARACION;
      tituloDialog = '¿Empezar a preparar?';
      mensajeDialog = 'El pedido pasará a la lista de "En preparación".';
    } 
    else if (estadoActual === EstadoPedido.EN_PREPARACION) {
      nuevoEstado = EstadoPedido.LISTO_PARA_ENTREGAR;
      tituloDialog = '¿Pedido listo?';
      mensajeDialog = 'El pedido se marcará como listo para que el cliente lo retire o se envíe.';
    } 
    else if (estadoActual === EstadoPedido.LISTO_PARA_ENTREGAR) {
      nuevoEstado = EstadoPedido.ENTREGADO;
      tituloDialog = '¿Entregaste el pedido?';
      mensajeDialog = 'Esta acción finalizará el pedido y lo moverá al historial.';
    } 
    else {
      return;
    }

    const confirmacion = await this.confirmService.ask({
      title: tituloDialog,
      message: mensajeDialog,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      icon: 'info',
      type: 'info'
    });

    if (confirmacion) {
      const pedidoActualizadoLocalmente = { ...this.pedido(), estado: nuevoEstado };

      const proceso = this.toastService.loading('Actualizando pedido...');

      this.pedidoServiceBackend.cambiarEstadoPedido(this.pedido().id, nuevoEstado).subscribe({
        next: (res) => {
          this.animarYRemover(() => {
            this.adminStore.actualizarUnPedidoEnLista(pedidoActualizadoLocalmente as PedidoDTO);
          });
          proceso.success('Pedido actualizado con éxito.');
        },
        error: (err) => {
          console.error('Error al avanzar estado', err);
          proceso.error('Hubo un error al actualizar el pedido');
          this.toastService.show('Error al guardar. Intenta de nuevo', 'error');
        }
      });
    }
  }

  async cancelarPedido() {
    this.closeMenu();

    const confirmacion = await this.confirmService.ask({
      title: '¿Cancelar pedido?',
      message: `El pedido de ${this.pedido().comprador_nombre} será cancelado definitivamente.`,
      confirmText: 'Sí, cancelar',
      cancelText: 'Volver',
      icon: 'trash',
      type: 'danger'
    });

    if (confirmacion) {
      const proceso = this.toastService.loading('Cancelando pedido...');
      const nuevoEstado = EstadoPedido.CANCELADO;

      this.pedidoServiceBackend.cambiarEstadoPedido(this.pedido().id, nuevoEstado).subscribe({
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

  private animarYRemover(accionFinal: () => void) {
    this.estadoAnimacion.set('removing');
    
    setTimeout(() => {
      accionFinal();
    }, 200); 
  }
}
