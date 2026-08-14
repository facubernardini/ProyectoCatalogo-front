import { Injectable, signal } from '@angular/core';

export interface OpcionMenu {
  label: string;
  icon: string;
  action: () => void;
  color?: 'normal' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {
  opciones = signal<OpcionMenu[]>([]);
  isOpen = signal<boolean>(false);

  setOpciones(nuevasOpciones: OpcionMenu[]) {
    this.opciones.set(nuevasOpciones);
  }

  limpiar() {
    this.opciones.set([]);
    this.isOpen.set(false);
  }

  toggleMenu() {
    this.isOpen.update(v => !v);
  }
}