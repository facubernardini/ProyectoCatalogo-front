import { Injectable, inject, signal } from '@angular/core';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { CategoriaManagerService } from 'src/app/core/services/categoria-manager.service';

@Injectable({ providedIn: 'root' })
export class CategoryFormService {
  private categoriaManager = inject(CategoriaManagerService);

  isOpen = signal(false);

  nombre = signal('');
  editingCategory = signal<CategoriaVendedor | null>(null);

  constructor() {
    this.categoriaManager.operationSuccess$.subscribe(() => {
      this.close();
    });
  }

  openCreate(nombreInicial: string = '') {
    this.editingCategory.set(null);
    this.nombre.set(nombreInicial);
    this.isOpen.set(true);
  }

  openEdit(categoria: CategoriaVendedor) {
    this.editingCategory.set({ ...categoria });
    this.nombre.set(categoria.nombre);
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.editingCategory.set(null);
    this.nombre.set('');
  }

  save(datos: Partial<CategoriaVendedor>) {
    if (!datos.nombre?.trim()) return;

    this.categoriaManager.guardar(datos, this.editingCategory());
    this.close();
  }
}