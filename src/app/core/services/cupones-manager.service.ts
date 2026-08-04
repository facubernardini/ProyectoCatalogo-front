import { inject, Injectable, signal } from '@angular/core';
import { AdminStoreService } from './admin-store.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { Cupon } from '../models/cupon.model';
import { finalize, Subject } from 'rxjs';
import { CuponServiceBackend } from '../services-backend/cupones.ServiceBackend';
import { MicroLoadingService } from './micro-loading.service';

@Injectable({ providedIn: 'root' })
export class CuponManagerService {
  private cuponBackend = inject(CuponServiceBackend);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  public isLoading = signal(false);

  // --- ELIMINAR ---
  async eliminar(cupon: Cupon) {
    const confirmacion = await this.confirmService.ask({
      title: '¿Eliminar cupón?',
      message: `¿Estás seguro de que querés eliminar el cupón "${cupon.codigo_cupon}"? Los clientes ya no podrán usarlo.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      icon: 'trash',
      type: 'danger'
    });

    if (!confirmacion) return;

    const proceso = this.toastService.loading('Eliminando cupón...');

    this.isLoading.set(true);
    this.cuponBackend.deleteCupon(cupon.id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.adminStore.eliminarCuponDeLista(cupon.id);
        proceso.success('Cupón eliminado con éxito');
      },
      error: (err) => {
        console.error('Error al eliminar cupón:', err);
        proceso.error('Hubo un error al intentar eliminar el cupón');
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

    const proceso = this.toastService.loading(estaActivo ? 'Pausando cupón...' : 'Reactivando cupón...');

    this.isLoading.set(true);

    this.cuponBackend.updateCupon(cupon.id, { activo: !estaActivo }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (cuponActualizado) => {
        this.adminStore.updateCuponEnLista(cuponActualizado);
        proceso.success(estaActivo ? 'Cupón pausado' : '¡Cupón activado con éxito!');
      },
      error: (err) => {
        console.error('Error al cambiar estado del cupón:', err);
        this.toastService.show('No se pudo cambiar el estado del cupón', 'error');
        proceso.error('No se pudo cambiar el estado del cupón');
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
      this.toastService.show('Ocurrió un error inesperado', 'error');
      return;
    }

    // Extraemos los datos base, ignorando ID y fechas
    const { id, createdAt, updatedAt, ...datosBase } = cupon as any;

    const nuevoCodigo = `${cupon.codigo_cupon}-${this.generarCodigoAleatorio()}`;

    const cuponDuplicado = {
      ...datosBase,
      catalogo_id: catalogoId,
      codigo_cupon: nuevoCodigo,
      activo: false,
    };

    const proceso = this.toastService.loading('Duplicando cupón...');

    this.isLoading.set(true);

    this.cuponBackend.createCupon(cuponDuplicado).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        this.adminStore.agregarCuponALista(res);
        proceso.success('¡Cupón duplicado con éxito!');

      },
      error: (err) => {
        console.error('Error al duplicar cupón:', err);
        proceso.error('Hubo un error al intentar duplicar el cupón');
      }
    });
  }

  private generarCodigoAleatorio(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = '';
    for (let i = 0; i < 3; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
  }

  // --- CREAR O EDITAR ---
  guardar(cuponData: any, currentCupon?: Cupon | null) {
    const catalogoId = this.adminStore.catalogo()?.id;

    if (!catalogoId) {
      this.toastService.show('Ocurrió un error inesperado', 'error');
      return;
    }

    const proceso = this.toastService.loading(currentCupon ? 'Actualizando cupón...' : 'Creando cupón...');

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
          proceso.success('Cupón actualizado');
        } else {
          this.adminStore.agregarCuponALista(res);
          proceso.success('Cupón creado con éxito');
        }
      },
      error: (err) => {
        console.error('Error al guardar cupón:', err);
        const mensajeError = err.error?.mensaje;
        proceso.error(mensajeError);
      }
    });
  }
}