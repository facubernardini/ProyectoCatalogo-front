import { Injectable, inject, signal } from '@angular/core';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { CategoriaManagerService } from 'src/app/core/services/categoria-manager.service';

@Injectable({ providedIn: 'root' })
export class CategoryFormService {
  private categoriaManager = inject(CategoriaManagerService);

  isOpen = signal(false);

  nombre = signal('');
  editingCategory = signal<CategoriaVendedor | null>(null);
  parentId = signal<number | null>(null);

  constructor() {
    this.categoriaManager.operationSuccess$.subscribe(() => {
      this.close();
    });
  }

  openCreate(nombreInicial: string = '', parentId: number | null = null) {
    this.editingCategory.set(null);
    this.nombre.set(nombreInicial);
    this.parentId.set(parentId);
    this.isOpen.set(true);
  }

  openEdit(categoria: CategoriaVendedor) {
    this.editingCategory.set({ ...categoria });
    this.nombre.set(categoria.nombre);
    this.parentId.set(categoria.parent_id);
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.editingCategory.set(null);
    this.nombre.set('');
    this.parentId.set(null);
  }

  save(datos: Partial<CategoriaVendedor>, imagenFile?: File) {
    if (!datos.nombre?.trim()) return;

    this.categoriaManager.guardar(datos, this.editingCategory(), imagenFile);
    this.close();
  }
}