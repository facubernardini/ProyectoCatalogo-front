import { Injectable, inject, signal } from '@angular/core';
import { CartService } from './cart.service';
import { Producto } from 'src/app/core/models/producto.model';
import { Presentacion } from 'src/app/core/models/presentacion.model';

@Injectable({ providedIn: 'root' })
export class ProductSelectorService {
  private cartService = inject(CartService);
  
  selectedProduct = signal<Producto | null>(null);
  isOpen = signal(false);

  private preventScrollRestore = signal(false);

  constructor() {
    window.addEventListener('popstate', () => {
      if (this.isOpen()) {
        this.cerrarModalInterno();
      }
    });
  }

  open(producto: Producto, fromModal: boolean = false) {
    const yaEstabaAbierto = this.isOpen();
    
    this.selectedProduct.set(producto);
    this.preventScrollRestore.set(fromModal);
    this.isOpen.set(true);

    document.body.style.overflow = 'hidden';

    if (!yaEstabaAbierto) {
      history.pushState({ modal: 'product-selector' }, '');
    }
  }

  close() {
    this.cerrarModalInterno();

    if (history.state?.modal === 'product-selector') {
      history.back();
    }
  }

  private cerrarModalInterno() {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    setTimeout(() => this.selectedProduct.set(null), 300);
    
    if (!this.preventScrollRestore()) {
      document.body.style.overflow = 'auto';
    }
  }

  seleccionarYAgregar(pres: Presentacion) {
    const prod = this.selectedProduct();
    if (prod) {
      this.cartService.agregarProducto(prod, pres);
      this.close();
    }
  }
}