import { Injectable, inject, signal } from '@angular/core';
import { Cupon } from 'src/app/core/models/cupon.model';
import { CuponManagerService } from 'src/app/core/services/cupones-manager.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class CuponFormService {
  private cuponManager = inject(CuponManagerService);
  private toastService = inject(ToastService);

  isOpen = signal(false);
  
  loading = this.cuponManager.isLoading;
  
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
      // Consideramos ambos nombres de propiedad por si acaso
      codigo_cupon: (cupon as any).codigo_cupon || (cupon as any).codigo || '',
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
    
    // 1. Validaciones del lado del Frontend
    if (!data.codigo_cupon?.trim()) {
      this.toastService.show('El código del cupón es obligatorio', 'error');
      return;
    }
    if (!data.descuento || data.descuento <= 0) {
      this.toastService.show('Ingresá un valor de descuento válido', 'error');
      return;
    }
    if (data.es_porcentaje && data.descuento > 100) {
      this.toastService.show('El porcentaje de descuento no puede ser mayor a 100%', 'error');
      return;
    }

    // 2. Armamos el payload final
    const payload = {
      codigo_cupon: data.codigo_cupon,
      es_porcentaje: data.es_porcentaje,
      descuento: data.descuento,
      tope_descuento: (data.es_porcentaje && data.tiene_tope) ? data.tope_descuento : null,
      fecha_expiracion: data.tiene_vencimiento && data.fecha_expiracion ? new Date(data.fecha_expiracion).toISOString() : null
    };

    // 3. Delegamos al Manager pasando el callback de cierre
    this.cuponManager.guardar(payload, this.editingCupon() ?? undefined, () => {
      this.close();
    });
  }

  delete(cupon: Cupon) {
    const currentCupon = this.editingCupon();
    
    // Verificamos por seguridad que el ID coincida (o si lo llamaron directamente desde la tabla)
    const cuponABorrar = cupon || currentCupon;
    
    if (cuponABorrar) {
      this.cuponManager.eliminar(cuponABorrar, () => {
        this.close();
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