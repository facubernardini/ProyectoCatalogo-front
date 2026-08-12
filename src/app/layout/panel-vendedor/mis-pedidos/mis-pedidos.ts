import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { EstadoPedido, PedidoDTO } from 'src/app/core/models/pedido.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "src/app/shared/components/icon";
import { PedidoCard } from "./pedido-card/pedido-card";
import { PedidoPreviewService } from 'src/app/shared/services/pedido-preview.service';
import { ActivatedRoute } from '@angular/router';
import { PedidoFormService } from 'src/app/shared/services/pedido-form.service';

@Component({
  selector: 'app-mis-pedidos',
  imports: [CommonModule, Icon, PedidoCard],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css'
})
export class MisPedidos implements OnInit {
  public adminStore = inject(AdminStoreService);
  public pedidoPreviewService = inject(PedidoPreviewService);
  public pedidoFormService = inject(PedidoFormService);

  private route = inject(ActivatedRoute);
  
  isDropdownOpen = signal<boolean>(false);
  
  filtroActivo = signal<EstadoPedido>(EstadoPedido.PENDIENTE);

  opcionesFiltro = [
    { valor: EstadoPedido.PENDIENTE, etiqueta: 'Sin procesar', color: 'bg-blue-500' },
    { valor: EstadoPedido.EN_PREPARACION, etiqueta: 'En preparación', color: 'bg-amber-500' },
    { valor: EstadoPedido.LISTO_PARA_ENTREGAR, etiqueta: 'Listos', color: 'bg-emerald-500' }
  ];

  filtroActual = computed(() => {
    return this.opcionesFiltro.find(opt => opt.valor === this.filtroActivo()) || this.opcionesFiltro[0];
  });

  pedidosFiltrados = computed(() => {
    const todos = this.adminStore.pedidosActivos();
    if (!Array.isArray(todos)) return [];
    
    return todos.filter(p => p.estado === this.filtroActivo());
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const estadoDeseado = params['estado'];
      
      if (estadoDeseado) {
        this.filtroActivo.set(estadoDeseado as EstadoPedido);
      }
    });
  }

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

  registrarNuevoPedido() {
    this.pedidoFormService.open();
  }
}
