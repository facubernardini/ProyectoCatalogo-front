import { inject, Injectable, signal } from '@angular/core';
import { AdminStoreService } from './admin-store.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { Cupon } from '../models/cupon.model';
import { finalize } from 'rxjs';
import { CuponServiceBackend } from '../services-backend/cupones.ServiceBackend';

@Injectable({ providedIn: 'root' })
export class CuponManagerService {
  private cuponBackend = inject(CuponServiceBackend);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  public isLoading = signal(false);

  // --- ELIMINAR ---
  async eliminar(cupon: Cupon, onSuccess?: () => void) {
    const confirmacion = await this.confirmService.ask({
      title: '¿Eliminar cupón?',
      message: `¿Estás seguro de que querés eliminar el cupón "${cupon.codigo_cupon}"? Los clientes ya no podrán usarlo.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      icon: 'trash',
      type: 'danger'
    });

    if (!confirmacion) return;

    this.isLoading.set(true);
    this.cuponBackend.deleteCupon(cupon.id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.adminStore.eliminarCuponDeLista(cupon.id);
        this.toastService.show('Cupón eliminado con éxito');
        
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        console.error('Error al eliminar cupón:', err);
        this.toastService.show('Hubo un error al intentar eliminar el cupón', 'error');
      }
    });
  }

  // --- PAUSAR / REANUDAR ---
  async toggleActivo(cupon: Cupon) {
    const estaActivo = cupon.activo;

    const confirmacion = await this.confirmService.ask({
      title: estaActivo ? '¿Pausar cupón?' : '¿Activar cupón?',
      message: estaActivo 
        ? `Tus clientes no podrán aplicar el código "${cupon.codigo_cupon}" hasta que lo vuelvas a activar.` 
        : `El cupón "${cupon.codigo_cupon}" volverá a estar disponible para tus clientes.`,
      confirmText: estaActivo ? 'Pausar' : 'Activar',
      cancelText: 'Volver',
      icon: estaActivo ? 'pause' : 'play',
      type: estaActivo ? 'warning' : 'info'
    });

    if (!confirmacion) return;

    this.isLoading.set(true);
    this.cuponBackend.updateCupon(cupon.id, { activo: !estaActivo }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (cuponActualizado) => {
        this.adminStore.updateCuponEnLista(cuponActualizado);
        this.toastService.show(estaActivo ? 'Cupón pausado' : '¡Cupón activado con éxito!');
      },
      error: (err) => {
        console.error('Error al cambiar estado del cupón:', err);
        this.toastService.show('No se pudo cambiar el estado del cupón', 'error');
      }
    });
  }

  // --- DUPLICAR ---
  async duplicar(cupon: Cupon) {
    const confirmacion = await this.confirmService.ask({
      title: '¿Duplicar cupón?',
      message: `Se creará una copia de "${cupon.codigo_cupon}".`,
      confirmText: 'Duplicar',
      cancelText: 'Cancelar',
      icon: 'copy', 
      type: 'info'
    });

    if (!confirmacion) return;

    const catalogoId = this.adminStore.catalogo()?.id;
    if (!catalogoId) {
      this.toastService.show('Error: No se pudo obtener el ID del catálogo', 'error');
      return;
    }

    // Extraemos los datos base, ignorando ID y fechas
    const { id, createdAt, updatedAt, ...datosBase } = cupon as any;

    const cuponDuplicado = {
      ...datosBase,
      catalogo_id: catalogoId,
      codigo_cupon: `${cupon.codigo_cupon}-COPIA`,
      activo: false, // Por seguridad lo creamos pausado
    };

    this.isLoading.set(true);
    this.cuponBackend.createCupon(cuponDuplicado).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        this.adminStore.agregarCuponALista(res);
        this.toastService.show('¡Cupón duplicado con éxito!');
      },
      error: (err) => {
        console.error('Error al duplicar cupón:', err);
        this.toastService.show('Hubo un error al intentar duplicar el cupón', 'error');
      }
    });
  }

  // --- CREAR O EDITAR ---
  guardar(cuponData: any, currentCupon?: Cupon | null, onSuccess?: () => void) {
    const catalogoId = this.adminStore.catalogo()?.id;

    if (!catalogoId) {
      console.error('Error: No se pudo obtener el ID del catálogo');
      return;
    }

    this.isLoading.set(true);
    
    const codigoRaw = cuponData.codigo_cupon;
    const codigoLimpio = codigoRaw?.toUpperCase().trim().replace(/\s+/g, '');

    const finalData = { 
      ...cuponData,
      codigo_cupon: codigoLimpio, 
      catalogo_id: catalogoId 
    };

    const request = currentCupon && currentCupon.id
      ? this.cuponBackend.updateCupon(currentCupon.id, finalData)
      : this.cuponBackend.createCupon(finalData);

    request.pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (currentCupon) {
          this.adminStore.updateCuponEnLista(res);
          this.toastService.show(`Cupón actualizado`);
        } else {
          this.adminStore.agregarCuponALista(res);
          this.toastService.show(`Cupón creado con éxito`);
        }
        
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        console.error('Error al guardar cupón:', err);
        const mensajeError = err.error?.error || 'No se pudo guardar el cupón';
        this.toastService.show(mensajeError, 'error');
      }
    });
  }
}