import { Component, inject } from '@angular/core';
import { PedidoRealizadoService } from '@shared/services/pedido-realizado.service';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-pedido-realizado',
  standalone: true,
  imports: [Icon],
  templateUrl: './pedido-realizado.html',
})
export class PedidoRealizado {
  public pedidoRealizadoService = inject(PedidoRealizadoService);

  cerrar() {
    this.pedidoRealizadoService.close();
  }

  reenviarWhatsapp() {
    const url = this.pedidoRealizadoService.whatsappUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }
}