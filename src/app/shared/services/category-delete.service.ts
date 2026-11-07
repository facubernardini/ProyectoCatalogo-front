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
    const categorias = this.adminStore.categorias();
    
    const aplanarCategorias = (lista: any[]) => {
      let resultado: any[] = [];
      
      lista.forEach(cat => {
        if (catActual && cat.id === catActual.id) return;
        
        const subcategoriasValidas = (cat.subcategorias || []).filter((sub: any) => {
          return !(catActual && sub.id === catActual.id);
        });

        if (cat.es_agrupadora && subcategoriasValidas.length === 0) {
          return;
        }
          
        resultado.push({ ...cat, _nivel: 0 });
        
        if (subcategoriasValidas.length > 0) {
          subcategoriasValidas.forEach((sub: any, index: number) => {
            const esUltima = index === subcategoriasValidas.length - 1;
            resultado.push({ ...sub, _nivel: 1, _isLastSub: esUltima });
          });
        }
      });
      
      return resultado;
    };

    return aplanarCategorias(categorias);
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