import { inject, Injectable, signal } from '@angular/core';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { CategoriaManagerService } from 'src/app/core/services/categoria-manager.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryPreviewService {
  public categoriaManager = inject(CategoriaManagerService);
	private toastService = inject(ToastService);
  
  loading = this.categoriaManager.isLoading;

  isOpen = signal(false);
  
  selectedCategory = signal<CategoriaVendedor | null>(null);

  constructor() {
    this.categoriaManager.operationSuccess$.subscribe(() => {
      this.close();
    });
  }

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

    this.categoriaManager.guardar(categoria, categoria);
  }
}