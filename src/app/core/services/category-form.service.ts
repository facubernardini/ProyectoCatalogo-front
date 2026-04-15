import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminStoreService } from './admin-store.service';
import { CategoriaService } from '../services-backend/categorias.ServiceBackend';
import { CategoriaVendedor } from '../models/categoriaVendedor.model';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class CategoryFormService {
  private categoriaBackend = inject(CategoriaService);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);

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

  save(datos: Partial<CategoriaVendedor>) {
    if (!datos.nombre?.trim()) return;

    this.loading.set(true);
    const currentCategory = this.editingCategory();
    
    const payload = {
      ...datos,
      catalogo_id: this.adminStore.catalogoId()
    };

    const request = currentCategory
      ? this.categoriaBackend.updateCategoria(currentCategory.id, payload)
      : this.categoriaBackend.createCategoria(payload);

    request.pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        if (currentCategory) {
          this.adminStore.updateCategoriaEnLista(res);
          this.toastService.show(`Categoría actualizada`);
        } else {
          this.adminStore.agregarCategoriaALista(res);
          this.toastService.show(`Categoría creada con éxito`);
        }
        this.close();
      },
      error: (err) => {
        console.error('Error al guardar categoría:', err);
        // Aquí podrías disparar un toast de error si tenés uno
      }
    });
  }

  delete(id: number) {
    // Usamos el ID directamente
    this.loading.set(true);
    this.categoriaBackend.deleteCategoria(id).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => {
        this.adminStore.eliminarCategoriaDeLista(id);
        this.close();
      },
      error: (err) => console.error('Error al eliminar categoría:', err)
    });
  }
}