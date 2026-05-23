import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuLateralService {
    isOpen = signal(false);

    categoriaSeleccionada = signal<string>('todos');

    open() { 
        this.isOpen.set(true); 
        document.body.style.overflow = 'hidden';
    }

    close() { 
        this.isOpen.set(false);
        document.body.style.overflow = 'auto';
    }

    seleccionar(nombre: string) {
        this.categoriaSeleccionada.set(nombre);
        this.close();
    }
}