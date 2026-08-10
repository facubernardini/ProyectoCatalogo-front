import { Injectable, signal } from '@angular/core';
import { PedidoDTO } from 'src/app/core/models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoPreviewService {
  isOpen = signal<boolean>(false);
  
  selectedPedido = signal<PedidoDTO | null>(null);

  open(pedido: PedidoDTO) {
    this.selectedPedido.set(pedido);
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    setTimeout(() => this.selectedPedido.set(null), 300); 
  }
}