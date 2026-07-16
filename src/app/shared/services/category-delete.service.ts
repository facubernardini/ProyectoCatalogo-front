import { Injectable, computed, inject, signal } from '@angular/core';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ToastService } from 'src/app/core/services/toast.service';

export interface ModalEliminarOptions {
  categoria: CategoriaVendedor;
  productosAfectados: any[];
}

export interface ModalEliminarResult {
  accion: 'mover' | 'eliminar';
  categoriaDestinoId?: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryDeleteService {
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);

  isOpen = signal(false);
  opciones = signal<ModalEliminarOptions | null>(null);
  
  accionHuerfanos = signal<'mover' | 'eliminar'>('mover');
  categoriaDestinoId = signal<number | null>(null);

  categoriasParaMover = computed(() => {
    const catActual = this.opciones()?.categoria;
    return this.adminStore.categorias().filter(c => c.id !== catActual?.id);
  });

  private resolveFn: ((value: ModalEliminarResult | null) => void) | null = null;

  ask(opciones: ModalEliminarOptions): Promise<ModalEliminarResult | null> {
    this.opciones.set(opciones);
    this.accionHuerfanos.set('mover'); 
    this.categoriaDestinoId.set(null); 
    this.isOpen.set(true);

    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  confirm() {
    if (this.accionHuerfanos() === 'mover' && !this.categoriaDestinoId()) {
      this.toastService.show('Por favor, seleccioná una categoría de destino', 'error');
      return; 
    }

    this.isOpen.set(false);
    
    if (this.resolveFn) {
      this.resolveFn({
        accion: this.accionHuerfanos(),
        categoriaDestinoId: this.categoriaDestinoId() ? Number(this.categoriaDestinoId()) : undefined
      });
      this.resolveFn = null;
    }
  }

  cancel() {
    this.isOpen.set(false);
    if (this.resolveFn) {
      this.resolveFn(null); 
      this.resolveFn = null;
    }
  }
}