import { Injectable, signal } from '@angular/core';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductPreviewService {
  isOpen = signal(false);
  selectedProduct = signal<Producto | null>(null);

  open(producto: Producto) {
    this.selectedProduct.set(producto);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.selectedProduct.set(null);
    document.body.style.overflow = 'auto';
  }
}