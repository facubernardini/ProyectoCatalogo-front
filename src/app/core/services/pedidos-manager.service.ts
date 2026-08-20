import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminStoreService } from './admin-store.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { PedidosServiceBackend } from '../services-backend/pedidos.ServiceBackend';
import { CrearPedidoRequest, EstadoPedido, PedidoDTO } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidosManagerService {
  private pedidosBackend = inject(PedidosServiceBackend);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  public isLoading = signal(false);

	// --- CREAR PEDIDO MANUAL ---
	crearPedidoManual(payload: CrearPedidoRequest, onSuccess?: () => void) {
    const proceso = this.toastService.loading('Creando pedido...');
    this.isLoading.set(true);

    this.pedidosBackend.registrarPedidoManual(payload).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (nuevoPedido: PedidoDTO) => {
        this.adminStore.agregarNuevoPedidoALista(nuevoPedido);
        this.adminStore.refrescarProductos();

        proceso.success(`Pedido #${nuevoPedido.numero_pedido} creado correctamente`);
        
        if (onSuccess) {
          onSuccess();
        }
      },
      error: (err) => {
        console.error('Error creando pedido manual:', err);
        proceso.error(err.error.message);
      }
    });
  }

	// --- EDITAR PEDIDO ---
  editarPedido(pedidoId: string, payload: any, onSuccess?: () => void) {
    const proceso = this.toastService.loading('Guardando cambios...');
    this.isLoading.set(true);

    this.pedidosBackend.editarPedido(pedidoId, payload).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (pedidoActualizadoDesdeBackend) => {
        this.adminStore.actualizarUnPedidoEnLista(pedidoActualizadoDesdeBackend);
        
        this.adminStore.refrescarProductos();
        
        proceso.success('Pedido actualizado correctamente');
        
        if (onSuccess) {
          onSuccess();
        }
      },
      error: (err) => {
        console.error('Error al guardar el pedido:', err);
        proceso.error(err.error.message);
      }
    });
  }

  // --- CANCELAR PEDIDO ---
  async cancelarPedido(pedido: PedidoDTO) {
    const confirmacion = await this.confirmService.ask({
      title: '¿Cancelar Pedido?',
      message: `El pedido #${pedido.numero_pedido} será cancelado y el stock regresará a tu inventario.`,
      confirmText: 'Cancelar Pedido',
      cancelText: 'Volver',
      icon: 'close',
      type: 'danger'
    });

    if (!confirmacion) return;

    const proceso = this.toastService.loading('Cancelando pedido...');
    this.isLoading.set(true);

    this.pedidosBackend.cambiarEstadoPedido(pedido.id, EstadoPedido.CANCELADO).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (pedidoActualizado) => {
        this.adminStore.actualizarUnPedidoEnLista(pedidoActualizado);
        
        this.adminStore.refrescarProductos(); 
        
        proceso.success('Pedido cancelado');
      },
      error: (err) => {
        console.error('Error al cancelar:', err);
        proceso.error('Error al intentar cancelar el pedido');
      }
    });
  }

  // --- MARCAR COMO ENTREGADO / FINALIZADO ---
  async finalizarPedido(pedido: PedidoDTO) {
    const confirmacion = await this.confirmService.ask({
      title: '¿Marcar como Entregado?',
      message: `El pedido #${pedido.numero_pedido} de ${pedido.comprador_nombre} pasará a estar finalizado.`,
      confirmText: 'Confirmar',
      cancelText: 'Volver',
      icon: 'check',
      type: 'info'
    });

    if (!confirmacion) return;

    const proceso = this.toastService.loading('Actualizando pedido...');
    this.isLoading.set(true);

    this.pedidosBackend.cambiarEstadoPedido(pedido.id, EstadoPedido.ENTREGADO).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (pedidoActualizado) => {
        this.adminStore.actualizarUnPedidoEnLista(pedidoActualizado);
        proceso.success('¡Pedido entregado con éxito!');
      },
      error: (err) => {
        console.error('Error al finalizar:', err);
        proceso.error('No se pudo actualizar el pedido');
      }
    });
  }

}