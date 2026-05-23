import { inject, Injectable, signal } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductoManagerService } from 'src/app/core/services/producto-manager.service';

@Injectable({ providedIn: 'root' })
export class ProductPreviewService {
  public productManager = inject(ProductoManagerService);

  loading = this.productManager.isLoading;
  
  isOpen = signal(false);
  selectedProduct = signal<Producto | null>(null);

  open(producto: Producto) {
    const copiaProducto = structuredClone(producto);
    
    this.selectedProduct.set(copiaProducto);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.selectedProduct.set(null);
    document.body.style.overflow = 'auto';
  }

  onGuardar(producto: Producto) {
    if (!producto || !producto.id) return;

    this.productManager.guardar(producto, producto);
    this.close();
  }
}