import { Component, effect, inject, signal } from '@angular/core';
import { PedidoRealizadoService } from '@shared/services/pedido-realizado.service';
import { Icon } from "@shared/components/icon";
import { Confeti } from "@shared/components/confeti/confeti";

@Component({
  selector: 'app-pedido-realizado',
  standalone: true,
  imports: [Icon, Confeti],
  templateUrl: './pedido-realizado.html',
})
export class PedidoRealizado {
  public pedidoRealizadoService = inject(PedidoRealizadoService);

  public mostrarConfeti = signal(false);

  constructor() {
    effect(() => {
      if (this.pedidoRealizadoService.isOpen()) {

        if (document.hidden) {
          const onVisibilityChange = () => {
            if (!document.hidden) {
              this.dispararConfeti();
              document.removeEventListener('visibilitychange', onVisibilityChange);
            }
          };
          
          document.addEventListener('visibilitychange', onVisibilityChange);

        } else {
          this.dispararConfeti();
        }

      } else {
        this.mostrarConfeti.set(false);
      }
    });
  }

  private dispararConfeti() {
    setTimeout(() => {
      this.mostrarConfeti.set(true);
    }, 100);

    setTimeout(() => {
      this.mostrarConfeti.set(false);
    }, 5000);
  }

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