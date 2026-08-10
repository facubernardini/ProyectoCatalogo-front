import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from "@shared/components/icon";
import { PedidoDTO } from 'src/app/core/models/pedido.model';
import { PedidoPreviewService } from '../../services/pedido-preview.service';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { MEDIO_PAGO_ICONS, MedioPago } from '../../enums/medio-pago.enum';
import { METODO_ENTREGA_ICONS, MetodoEntrega } from '../../enums/metodo-entrega.enum';

@Component({
  selector: 'app-pedido-preview',
  standalone: true,
  imports: [CommonModule, Icon, FormsModule, SwipeDownDirective],
  templateUrl: './pedido-preview.html',
})
export class PedidoPreview implements OnInit {
  
  public pedidoPreviewService = inject(PedidoPreviewService);
  
  pedido!: PedidoDTO;
  
  isEditing = signal<boolean>(false);
  searchQuery = signal<string>('');

  listaMediosPago = Object.values(MedioPago);
  medioPagoIcons = MEDIO_PAGO_ICONS;

  listaMetodosEntrega = Object.values(MetodoEntrega);
  metodoEntregaIcons = METODO_ENTREGA_ICONS;

  ngOnInit() {
    const actual = this.pedidoPreviewService.selectedPedido();
    if (actual) {
      this.pedido = JSON.parse(JSON.stringify(actual));
    }
  }

  cerrar() {
    this.pedidoPreviewService.close();
  }

  toggleEdit() {
    this.isEditing.update(v => !v);
  }

  getIconoPago(metodo: string): string {
    return this.medioPagoIcons[metodo as MedioPago] || 'help-circle';
  }

  getIconoEntrega(metodo: string): string {
    return this.metodoEntregaIcons[metodo as MetodoEntrega] || 'shop';
  }

  // --- Lógica de Edición ---

  onBuscarProducto() {
    console.log('Buscando:', this.searchQuery());
    // Lógica para autocompletar productos...
  }

  eliminarProducto(index: number) {
    if (!this.isEditing() || !this.pedido.productos) return;
    this.pedido.productos.splice(index, 1);
    this.recalcularTotal();
  }

  recalcularTotal() {
    if (!this.pedido.productos) {
      this.pedido.total_final = 0;
      return;
    }
    this.pedido.total_final = this.pedido.productos.reduce(
      (acc, p) => acc + (p.cantidad * p.precio_unitario), 0
    );
  }

  datosInvalidos(): boolean {
    return !this.pedido.comprador_nombre || (this.pedido.productos?.length === 0);
  }

  guardar() {
    console.log('Guardando cambios del pedido:', this.pedido);
    // Aquí enviarás el 'this.pedido' actualizado al backend / Store
    this.cerrar();
  }
}