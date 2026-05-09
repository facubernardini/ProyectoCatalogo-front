import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminStoreService } from './admin-store.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { Cupon } from '../models/cupon.model';
import { CuponServiceBackend } from '../services-backend/cupones.ServiceBackend';

@Injectable({ providedIn: 'root' })
export class CuponFormService {
  private cuponBackend = inject(CuponServiceBackend);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  public confirmService = inject(ConfirmService);

  isOpen = signal(false);
  loading = signal(false);
  editingCupon = signal<Cupon | null>(null);

  formData = signal({
    codigo_cupon: '',
    es_porcentaje: true,
    descuento: null as number | null,
    tiene_tope: false,
    tope_descuento: null as number | null,
    tiene_vencimiento: false,
    fecha_expiracion: '' as string | null
  });

  openCreate() {
    this.editingCupon.set(null);
    this.resetForm();
    this.isOpen.set(true);
		document.body.style.overflow = 'hidden';
  }

  openEdit(cupon: Cupon) {
    this.editingCupon.set({ ...cupon });
    
    // Formateamos la fecha para el input type="date" (YYYY-MM-DD)
    let fechaFormat = '';
    if (cupon.fecha_expiracion) {
        const d = new Date(cupon.fecha_expiracion);
        if (!isNaN(d.getTime())) {
            fechaFormat = d.toISOString().split('T')[0];
        }
    }

    this.formData.set({
      codigo_cupon: cupon.codigo_cupon || (cupon as any).codigo || '',
      es_porcentaje: cupon.es_porcentaje,
      descuento: Number(cupon.descuento),
      tiene_tope: cupon.tope_descuento !== null && cupon.tope_descuento > 0,
      tope_descuento: cupon.tope_descuento ? Number(cupon.tope_descuento) : null,
      tiene_vencimiento: !!fechaFormat,
      fecha_expiracion: fechaFormat
    });

    this.isOpen.set(true);
		document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.editingCupon.set(null);
    this.resetForm();
		document.body.style.overflow = 'auto';
  }

  private resetForm() {
    this.formData.set({
      codigo_cupon: '',
      es_porcentaje: true,
      descuento: null,
      tiene_tope: false,
      tope_descuento: null,
      tiene_vencimiento: false,
      fecha_expiracion: ''
    });
  }

  save() {
    const data = this.formData();
    
    if (!data.codigo_cupon?.trim()) {
			this.toastService.show('El código del cupón es obligatorio', 'error');
			return;
    }
    if (!data.descuento || data.descuento <= 0) {
			this.toastService.show('Ingresá un valor de descuento válido', 'error');
			return;
    }

    this.loading.set(true);
    const current = this.editingCupon();
    
    const payload = {
      catalogo_id: this.adminStore.catalogoId(),
      codigo_cupon: data.codigo_cupon.toUpperCase().trim(),
      es_porcentaje: data.es_porcentaje,
      descuento: data.descuento,
      tope_descuento: (data.es_porcentaje && data.tiene_tope) ? data.tope_descuento : null,
      fecha_expiracion: data.tiene_vencimiento && data.fecha_expiracion ? new Date(data.fecha_expiracion).toISOString() : null
    };

    const request = current
      ? this.cuponBackend.updateCupon(current.id, payload)
      : this.cuponBackend.createCupon(payload);

    request.pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        if (current) {
          this.adminStore.updateCuponEnLista(res);
          this.toastService.show(`Cupón actualizado`);
        } else {
          this.adminStore.agregarCuponALista(res);
          this.toastService.show(`Cupón creado con éxito`);
        }
        this.close();
      },
      error: (err) => {
        console.error('Error al guardar cupón:', err);
        this.toastService.show(`Error al guardar el cupón`, 'error');
      }
    });
  }

  async delete(id: number) {
    const confirmacion = await this.confirmService.ask({
        title: '¿Eliminar cupón?',
        message: `Estás por borrar el cupón "${this.formData().codigo_cupon}". Esta acción no se puede deshacer.`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Volver',
        icon: 'trash',
        type: 'danger'
      });

    if (confirmacion) {
      this.loading.set(true);
      this.cuponBackend.deleteCupon(id).pipe(
        finalize(() => this.loading.set(false))
      ).subscribe({
        next: () => {
          this.adminStore.eliminarCuponDeLista(id);
          this.close();
        },
        error: (err) => console.error('Error al eliminar cupón:', err)
      });
    }
  }

	cambiarTipoDescuento(esPorcentaje: boolean) {
    const dataActual = this.formData();
    
    if (dataActual.es_porcentaje !== esPorcentaje) {
      this.formData.update(val => ({
        ...val,
        es_porcentaje: esPorcentaje,
        descuento: null
      }));
    }
  }
}