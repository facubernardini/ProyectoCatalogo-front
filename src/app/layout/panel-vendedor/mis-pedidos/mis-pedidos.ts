import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { EstadoPedido, PedidoDTO } from 'src/app/core/models/pedido.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "src/app/shared/components/icon";
import { PedidoCard } from "./pedido-card/pedido-card";
import { PedidoPreviewService } from 'src/app/shared/services/pedido-preview.service';
import { PedidoPreview } from "src/app/shared/dialogs/pedido-preview/pedido-preview";

@Component({
  selector: 'app-mis-pedidos',
  imports: [CommonModule, Icon, PedidoCard, PedidoPreview],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css',
})
export class MisPedidos {
  public adminStore = inject(AdminStoreService);
  public pedidoPreviewService = inject(PedidoPreviewService);
  
  isDropdownOpen = signal<boolean>(false);
  
  // Estado para saber qué filtro está activo (Por defecto: PENDIENTE)
  filtroActivo = signal<EstadoPedido>(EstadoPedido.PENDIENTE);

  // Opciones disponibles para el dropdown superior izquierdo
  opcionesFiltro = [
    { valor: EstadoPedido.PENDIENTE, etiqueta: 'Sin procesar', color: 'bg-gray-500' },
    { valor: EstadoPedido.EN_PREPARACION, etiqueta: 'En preparación', color: 'bg-brand-accent' },
    { valor: EstadoPedido.LISTO_PARA_ENTREGAR, etiqueta: 'Listos', color: 'bg-emerald-500' }
  ];

  // Señal computada para obtener fácilmente la etiqueta y color del filtro actual
  filtroActual = computed(() => {
    return this.opcionesFiltro.find(opt => opt.valor === this.filtroActivo()) || this.opcionesFiltro[0];
  });

  pedidosFiltrados = computed(() => {
    const todos = this.adminStore.pedidosActivos();
    if (!Array.isArray(todos)) return []; // Por seguridad
    
    return todos.filter(p => p.estado === this.filtroActivo());
  });

  seleccionarFiltro(estado: EstadoPedido) {
    this.filtroActivo.set(estado);
    this.isDropdownOpen.set(false);
  }

  verFinalizados() {
    console.log('Navegar a historial de finalizados...');
  }

  abrirModalDetalle(pedido: PedidoDTO) {
    this.pedidoPreviewService.open(pedido);
  }

  onAddPedido() {
    
  }
}
