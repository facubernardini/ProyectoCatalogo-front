import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminStoreService } from './admin-store.service';
import { CategoriaService } from '../services-backend/categorias.ServiceBackend';
import { CategoriaVendedor } from '../models/categoriaVendedor.model';

@Injectable({ providedIn: 'root' })
export class CategoryFormService {
  private categoriaBackend = inject(CategoriaService);
  private adminStore = inject(AdminStoreService);

  isOpen = signal(false);
  loading = signal(false);

  nombre = signal('');
  editingCategory = signal<CategoriaVendedor | null>(null);

  openCreate() {
    this.nombre.set('');
    this.editingCategory.set(null);
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

  save() {
    const nombreValor = this.nombre().trim();
    if (!nombreValor) return;

    this.loading.set(true);
    const currentCategory = this.editingCategory();
    const catalogoId = this.adminStore.catalogoId;

    const request = currentCategory
      ? this.categoriaBackend.updateCategoria(currentCategory.id, { nombre: nombreValor })
      : this.categoriaBackend.createCategoria(nombreValor, catalogoId());

    request.pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        if (currentCategory) {
          this.adminStore.updateCategoriaEnLista(res);
        } else {
          this.adminStore.agregarCategoriaALista(res);
        }
        this.close();
      },
      error: (err) => console.error('Error al guardar categoría:', err)
    });
  }

  delete(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;

    this.loading.set(true);
    this.categoriaBackend.deleteCategoria(id).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => {
        this.adminStore.eliminarCategoriaDeLista(id);
        this.close(); // Cerramos el form si estaba abierto
      },
      error: (err) => console.error('Error al eliminar categoría:', err)
    });
  }
}