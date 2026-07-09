import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InfoService {
  isOpen = signal(false);

	constructor() {
    window.addEventListener('popstate', () => {
      if (this.isOpen() && history.state?.modal !== 'info-modal') {
        this.cerrarInterno();
      }
    });
  }

  open() { 
    if (this.isOpen()) return;

    this.isOpen.set(true); 
    document.body.style.overflow = 'hidden';

    history.pushState({ modal: 'info-modal' }, '');
  }
  
  close() { 
    this.cerrarInterno();

    if (history.state?.modal === 'info-modal') {
      history.back();
    }
  }

  private cerrarInterno() {
    if (!this.isOpen()) return;

    this.isOpen.set(false); 
    document.body.style.overflow = 'auto';
  }
}