import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PedidoRealizadoService {
  isOpen = signal(false);

  whatsappUrl = signal<string>('');

  open(url: string) {
    if (this.isOpen()) return;

    this.whatsappUrl.set(url);

    this.isOpen.set(true); 
    document.body.style.overflow = 'hidden';
  }
  
  close() { 
    if (!this.isOpen()) return;

    this.isOpen.set(false); 
    document.body.style.overflow = 'auto';
  }
  
}