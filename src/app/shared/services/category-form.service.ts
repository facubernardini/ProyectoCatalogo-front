import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { CategoriaService } from 'src/app/core/services-backend/categorias.ServiceBackend';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class CategoryFormService {
  private categoriaBackend = inject(CategoriaService);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  public confirmService = inject(ConfirmService);

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
        this.toastService.show(`Error al guardar categoría`);
      }
    });
  }

  async delete(id: number) {
    const confirmacion = await this.confirmService.ask({
        title: '¿Eliminar categoría?',
        message: `Estás por borrar "${this.editingCategory()?.nombre}".`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Volver',
        icon: 'trash',
        type: 'danger'
      });

    if (confirmacion) {
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
}