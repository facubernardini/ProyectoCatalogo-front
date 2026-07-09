import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuLateralService {
  isOpen = signal(false);

  categoriaSeleccionada = signal<string>('todos');

  constructor() {
    window.addEventListener('popstate', () => {
      if (this.isOpen() && history.state?.modal !== 'menu-lateral') {
        this.cerrarInterno();
      }
    });
  }

  open() { 
    if (this.isOpen()) return;

    this.isOpen.set(true); 
    document.body.style.overflow = 'hidden';

    history.pushState({ modal: 'menu-lateral' }, '');
  }

  close() { 
    this.cerrarInterno();

    if (history.state?.modal === 'menu-lateral') {
      history.back();
    }
  }

  private cerrarInterno() {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    document.body.style.overflow = 'auto';
  }

  seleccionar(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
    this.close();
  }
}