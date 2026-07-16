import { Injectable, inject, signal } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductoManagerService } from 'src/app/core/services/producto-manager.service';

@Injectable({ providedIn: 'root' })
export class ProductFormService {
  private productManager = inject(ProductoManagerService);

  isOpen = signal(false);
  
  editingProduct = signal<Producto | null>(null);

  openCreate() {
    this.editingProduct.set(null);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  openEdit(producto: Producto) {
    this.editingProduct.set({ ...producto });
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.editingProduct.set(null);
    document.body.style.overflow = 'auto';
  }

  save(productData: any, imagenFile?: File | null) {
    const currentProduct = this.editingProduct();
    
    this.productManager.guardar(productData, currentProduct, imagenFile);

    this.close();
  }

}