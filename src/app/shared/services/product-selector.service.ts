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
  private closeTimeoutId: ReturnType<typeof setTimeout> | null = null; 

  private overflowAnterior = ''; 

  open(producto: Producto, fromModal: boolean = false) {
    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId);
      this.closeTimeoutId = null;
    }
    
    this.selectedProduct.set(producto);
    this.preventScrollRestore.set(fromModal);
    this.isOpen.set(true);

    this.overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    
    this.closeTimeoutId = setTimeout(() => {
      this.selectedProduct.set(null);
      this.closeTimeoutId = null;
    }, 300);
    
    if (!this.preventScrollRestore()) {
      document.body.style.overflow = this.overflowAnterior;
    }
  }

  seleccionarYAgregar(pres: Presentacion, cantidad: number) {
    const prod = this.selectedProduct();
    if (prod) {
      this.cartService.agregarProducto(prod, pres, cantidad);
    }
  }
}