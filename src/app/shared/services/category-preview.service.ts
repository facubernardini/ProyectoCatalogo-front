import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { CategoriaService } from 'src/app/core/services-backend/categorias.ServiceBackend';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryPreviewService {
	private categoriaBackend = inject(CategoriaService);
	private adminStore = inject(AdminStoreService);
	private toastService = inject(ToastService);
  
  loading = signal(false);
  isOpen = signal(false);
  
  selectedCategory = signal<CategoriaVendedor | null>(null);

  open(categoria: any) {
    this.selectedCategory.set(structuredClone(categoria));
    this.isOpen.set(true);
    
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.loading.set(false);
    this.selectedCategory.set(null);

    document.body.style.overflow = 'auto';
  }

	onGuardar(categoria: CategoriaVendedor) {
    if (!categoria || !categoria.id) return;
    
    if (!categoria.nombre?.trim()) {
      this.toastService.show('El nombre de la categoría es obligatorio', 'error');
      return;
    }

    this.loading.set(true);

    const { productos, ...datosRestantes } = categoria as any;

    const payload = {
      ...datosRestantes,
      nombre: categoria.nombre.trim()
    };

    this.categoriaBackend.updateCategoria(categoria.id, payload)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          this.adminStore.updateCategoriaEnLista(res); 
          this.toastService.show('Categoría actualizada');
          this.close();
        },
        error: (err) => {
          console.error('Error al actualizar la categoría:', err);
          this.toastService.show('Error al guardar los cambios', 'error');
        }
      });
  }
}