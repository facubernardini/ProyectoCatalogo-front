import { Injectable, inject, signal } from '@angular/core';
import { Cupon } from 'src/app/core/models/cupon.model';
import { CuponManagerService } from 'src/app/core/services/cupones-manager.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class CuponFormService {
  private cuponManager = inject(CuponManagerService);
  private toastService = inject(ToastService);

  isOpen = signal(false);
  
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
  
  let fechaFormat = '';
  if (cupon.fecha_expiracion) {
      const d = new Date(cupon.fecha_expiracion);
      if (!isNaN(d.getTime())) {
        // Extraemos el año, mes y día en la hora LOCAL del usuario
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        fechaFormat = `${year}-${month}-${day}`;
      }
  }

  this.formData.set({
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

    let fechaFinal = null;
    if (data.tiene_vencimiento && data.fecha_expiracion) {
      fechaFinal = new Date(`${data.fecha_expiracion}T23:59:59`).toISOString();
    }

    const payload = {
      codigo_cupon: data.codigo_cupon,
      es_porcentaje: data.es_porcentaje,
      descuento: data.descuento,
      tope_descuento: (data.es_porcentaje && data.tiene_tope) ? data.tope_descuento : null,
      fecha_expiracion: fechaFinal // Usamos la variable que calculamos arriba
    };

    this.cuponManager.guardar(payload, this.editingCupon());
    this.close();
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