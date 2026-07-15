import { inject, Injectable, signal } from '@angular/core';
import { AdminStoreService } from './admin-store.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { CategoriaService } from '../services-backend/categorias.ServiceBackend';
import { finalize, Subject } from 'rxjs';
import { CategoriaVendedor } from '../models/categoriaVendedor.model';
import { MicroLoadingService } from './micro-loading.service';

@Injectable({ providedIn: 'root' })
export class CategoriaManagerService {
  private categoriaBackend = inject(CategoriaService);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private microLoading = inject(MicroLoadingService);

  public isLoading = signal(false);

  private operationSuccess = new Subject<void>();
  public operationSuccess$ = this.operationSuccess.asObservable();

  // --- ELIMINAR ---
  eliminar(categoriaId: number, accionProductos: 'mover' | 'eliminar', categoriaDestino?: number) {
    this.isLoading.set(true);
    
    this.categoriaBackend.deleteCategoria(categoriaId, accionProductos, categoriaDestino).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.adminStore.eliminarCategoriaDeLista(categoriaId);
        
        if (accionProductos === 'mover' && categoriaDestino) {
          this.adminStore.moverProductosACategoria(categoriaId, categoriaDestino);
        } else if (accionProductos === 'eliminar') {
          this.adminStore.eliminarProductosPorCategoria(categoriaId);
        }
        
        this.toastService.show('Categoría eliminada con éxito');
        this.microLoading.hide();
      },
      error: (err) => {
        console.error('Error al eliminar categoría:', err);
        this.toastService.show('Hubo un error al intentar eliminar la categoría', 'error');
        this.microLoading.hide();
      }
    });
  }

  // --- DESTACAR / ESPECIAL ---
  async toggleEspecial(categoria: CategoriaVendedor) {
    const esEspecial = categoria.especial;

    const confirmacion = await this.confirmService.ask({
      title: esEspecial ? '¿Quitar de especiales?' : '¿Destacar categoría?',
      message: esEspecial 
        ? 'Esta categoría dejará de tener prioridad visual en tu catálogo.' 
        : 'Esta categoría aparecerá primera en la lista para tus clientes.',
      confirmText: esEspecial ? 'Quitar' : 'Destacar',
      cancelText: 'Volver',
      icon: 'star',
      type: esEspecial ? 'warning' : 'info'
    });

    if (!confirmacion) return;

    this.microLoading.show('Actualizando...');

    this.isLoading.set(true);
    this.categoriaBackend.updateCategoria(categoria.id, { especial: !esEspecial }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (categoriaActualizada) => {
        this.adminStore.updateCategoriaEnLista(categoriaActualizada);
        this.toastService.show(esEspecial ? 'Categoría normalizada' : '¡Categoría destacada con éxito!');
        this.microLoading.hide();
      },
      error: (err) => {
        console.error('Error al actualizar estado especial:', err);
        this.toastService.show('No se pudo actualizar el estado de la categoría', 'error');
        this.microLoading.hide();
      }
    });
  }

  // --- PAUSAR / REANUDAR ---
  async toggleActivo(categoria: CategoriaVendedor) {
    const estaActiva = categoria.activo;

    const confirmacion = await this.confirmService.ask({
      title: estaActiva ? '¿Pausar categoría?' : '¿Activar categoría?',
      message: estaActiva 
        ? 'La categoría y sus productos dejarán de estar visibles en el catálogo público hasta que la actives de nuevo.' 
        : 'La categoría volverá a mostrarse normalmente en el menú de tus clientes.',
      confirmText: estaActiva ? 'Pausar' : 'Activar',
      cancelText: 'Volver',
      icon: estaActiva ? 'pause' : 'play',
      type: estaActiva ? 'warning' : 'info'
    });

    if (!confirmacion) return;

    this.microLoading.show('Actualizando...');

    this.isLoading.set(true);
    this.categoriaBackend.updateCategoria(categoria.id, { activo: !estaActiva }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (categoriaActualizada) => {
        this.adminStore.updateCategoriaEnLista(categoriaActualizada);
        this.toastService.show(
          estaActiva ? 'Categoría pausada correctamente' : 'Categoría activada correctamente'
        );
        this.microLoading.hide();
      },
      error: (err) => {
        console.error('Error al cambiar estado de la categoría:', err);
        this.toastService.show('No se pudo cambiar el estado de la categoría', 'error');
        this.microLoading.hide();
      }
    });
  }

  // --- CREAR O EDITAR ---
  guardar(categoriaData: any, currentCategoria?: CategoriaVendedor) {
    const catalogoId = this.adminStore.catalogo()?.id;

    if (!catalogoId) {
      console.error('Error: No se pudo obtener el ID del catálogo');
      return;
    }

    this.isLoading.set(true);
    
    const finalData = { 
      ...categoriaData, 
      catalogo_id: catalogoId 
    };

    const request = currentCategoria && currentCategoria.id
      ? this.categoriaBackend.updateCategoria(currentCategoria.id, finalData)
      : this.categoriaBackend.createCategoria(finalData);

    request.pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (currentCategoria) {
          this.adminStore.updateCategoriaEnLista(res);
          this.toastService.show(`Categoría actualizada`);
        } else {
          this.adminStore.agregarCategoriaALista(res);
          this.toastService.show(`Categoría creada con éxito`);
        }
        this.operationSuccess.next();
      },
      error: (err) => {
        console.error('Error al guardar categoría:', err);
        this.toastService.show('No se pudo guardar la categoría', 'error');
      }
    });
  }
}