import { Injectable, signal } from '@angular/core';
import { PedidoDTO } from 'src/app/core/models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoPreviewService {
  isOpen = signal<boolean>(false);
  
  pedidoSeleccionado = signal<PedidoDTO | null>(null);

  isEditing = signal<boolean>(false);

  open(pedido: PedidoDTO, editMode: boolean = false) {
    this.pedidoSeleccionado.set(pedido);
    this.isEditing.set(editMode);
    this.isOpen.set(true);

    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.isEditing.set(false);

    document.body.style.overflow = 'auto';
    setTimeout(() => this.pedidoSeleccionado.set(null), 300); 
  }
}