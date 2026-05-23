import { Injectable, inject, signal } from '@angular/core';
import { CartService } from './cart.service';
import { Producto } from 'src/app/core/models/producto.model';
import { Presentacion } from 'src/app/core/models/presentacion.model';

@Injectable({ providedIn: 'root' })
export class ProductSelectorService {
  private cartService = inject(CartService);
  
  selectedProduct = signal<Producto | null>(null);
  isOpen = signal(false);

  open(producto: Producto) {
    // Si tiene una sola presentación, al carrito directo
    if (producto.presentaciones.length === 1) {
      this.cartService.agregarProducto(producto, producto.presentaciones[0]);
      return;
    }
    
    // Si tiene varias, abrimos el "bottom sheet"
    this.selectedProduct.set(producto);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    setTimeout(() => this.selectedProduct.set(null), 300);
    document.body.style.overflow = 'auto';
  }

  seleccionarYAgregar(pres: Presentacion) {
    const prod = this.selectedProduct();
    if (prod) {
      this.cartService.agregarProducto(prod, pres);
      this.close();
    }
  }
}