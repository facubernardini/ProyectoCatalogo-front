import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CategoryViewService {
  isOpen = signal(false);
  categoria = signal<string>('');

  open(nombre: string) {
    this.categoria.set(nombre);
    this.isOpen.set(true);
		document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    setTimeout(() => this.categoria.set(''), 300); 
		document.body.style.overflow = 'auto';
  }
}