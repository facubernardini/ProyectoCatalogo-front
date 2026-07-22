import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PedidoRealizadoService {
  isOpen = signal(false);

	metodoEntrega = signal<'envio' | 'retiro' | null>(null);
  whatsappUrl = signal<string>('');

	constructor() {
    window.addEventListener('popstate', () => {
      if (this.isOpen() && history.state?.modal !== 'pedido-realizado') {
        this.cerrarInterno();
      }
    });
  }

  open(metodo: 'envio' | 'retiro', url: string) { 
    if (this.isOpen()) return;

    this.metodoEntrega.set(metodo);
    this.whatsappUrl.set(url);

    this.isOpen.set(true); 
    document.body.style.overflow = 'hidden';

    history.pushState({ modal: 'pedido-realizado' }, window.location.href);
  }
  
  close() { 
    this.cerrarInterno();

    if (history.state?.modal === 'pedido-realizado') {
      history.back();
    }
  }

  private cerrarInterno() {
    if (!this.isOpen()) return;

    this.isOpen.set(false); 
    document.body.style.overflow = 'auto';
  }
}