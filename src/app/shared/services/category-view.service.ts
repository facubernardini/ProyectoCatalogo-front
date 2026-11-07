import { Injectable, signal } from '@angular/core';
import { CategoriaViewData } from 'src/app/core/models/categoriaVendedor.model';

@Injectable({ providedIn: 'root' })
export class CategoryViewService {
  isOpen = signal(false);
  categoria = signal<CategoriaViewData | null>(null);

  open(data: CategoriaViewData) {
    this.categoria.set(data);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    setTimeout(() => this.categoria.set(null), 300); 
    document.body.style.overflow = 'auto';
  }
}