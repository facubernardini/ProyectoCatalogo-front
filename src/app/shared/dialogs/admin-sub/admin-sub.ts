import { Component, computed, effect, inject, signal } from '@angular/core';
import { AdminSubscriptionService } from '@shared/services/admin-sub.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { Icon } from "@shared/components/icon";
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { SuscripcionesService } from 'src/app/core/services-backend/suscripciones.ServiceBackend';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { FormsModule } from '@angular/forms';
import { SuscripcionAccion, SuscripcionEstado } from '../../enums/suscripcion.enum';

@Component({
  selector: 'app-admin-sub',
  imports: [Icon, SwipeDownDirective, FormsModule],
  templateUrl: './admin-sub.html',
  styleUrl: './admin-sub.css',
})
export class AdminSub {
  private adminStore = inject(AdminStoreService);
  public subscriptionService = inject(AdminSubscriptionService);
  private suscripcionServiceBackend = inject(SuscripcionesService);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  planSeleccionado = signal<any>(null);
  modoRenovacion = signal<'rapida' | 'exacta'>('rapida');
  fechaExacta = signal<string>('');
  precioPagado = signal<number>(0);

  datos = computed(() => this.subscriptionService.vendedorSeleccionado());
  suscripcion = computed(() => this.datos()?.suscripcion);

  esMismoPlan = computed(() => {
    return this.suscripcion()?.plan === this.planSeleccionado()?.tipo_plan;
  });

  constructor() {
    effect(() => {
      if (this.subscriptionService.isOpen()) {
        const planActualStr = this.suscripcion()?.plan;
        const planes = this.subscriptionService.planesDisponibles();
        
        const planMatch = planes.find(p => p.tipo_plan === planActualStr);
        
        this.planSeleccionado.set(planMatch || null);
        this.modoRenovacion.set('rapida');
        this.fechaExacta.set('');
        this.precioPagado.set(0);
      }
    });
  }

  // --- UI COMPUTEDS (Los que ya tenías) ---
  diasRestantes = computed(() => {
    const fin = this.suscripcion()?.fecha_fin;
    if (!fin) return 0;
    const diffTime = new Date(fin).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 0;
  });

  estadoUI = computed(() => {
    const estado = this.suscripcion()?.estado;
    switch (estado) {
      case SuscripcionEstado.ACTIVA:
        return { texto: 'ACTIVA', clases: 'bg-green-50 text-green-600 border-green-200' };
      case SuscripcionEstado.PENDIENTE_PAGO:
        return { texto: 'PENDIENTE DE PAGO', clases: 'bg-yellow-50 text-yellow-600 border-yellow-200' };
      default:
        return { texto: 'CANCELADA / VENCIDA', clases: 'bg-red-50 text-red-600 border-red-200' };
    }
  });

  // --- MÉTODOS DEL FORMULARIO ---

  seleccionarFecha(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fechaExacta.set(input.value);
    this.modoRenovacion.set('exacta');
  }

  async aplicarAccion() {
    const vendor = this.datos();
    const sub = this.suscripcion();
    const planSel = this.planSeleccionado();

    if (!vendor || !sub || !planSel) return;

    if (this.modoRenovacion() === 'exacta' && !this.fechaExacta()) {
      this.toastService.show('Por favor seleccioná una fecha válida.', 'error');
      return;
    }

    const esRenovacion = this.esMismoPlan();
    let tipoAccion = SuscripcionAccion.RENOVACION;

    if (!esRenovacion) {
      const planActualObj = this.subscriptionService.planesDisponibles().find(p => p.tipo_plan === sub.plan);
      if (planActualObj && planSel.id > planActualObj.id) {
        tipoAccion = SuscripcionAccion.UPGRADE;
      } else {
        tipoAccion = SuscripcionAccion.DOWNGRADE;
      }
    }

    const textoTiempo = this.modoRenovacion() === 'rapida' 
      ? '+1 Mes' 
      : `hasta el ${this.formatearFecha(this.fechaExacta())}`;

    const titulo = esRenovacion ? 'Confirmar Renovación' : `Confirmar ${tipoAccion}`;
    const mensaje = esRenovacion
      ? `¿Confirmás la renovación del plan "${planSel.tipo_plan}" para ${vendor.nombre_apellido} por ${textoTiempo}?`
      : `¿Cambiar a ${vendor.nombre_apellido} al plan "${planSel.tipo_plan}" y renovarlo ${textoTiempo}?`;

    const confirmacion = await this.confirmService.ask({
      title: titulo,
      message: mensaje,
      confirmText: 'Sí, aplicar',
      cancelText: 'Cancelar',
      icon: 'check',
      type: 'info'
    });

    if (confirmacion) {
      
      // 1. Armamos el payload con la estructura que espera tu controlador Node
      const payload = {
        vendedor_id: vendor.id,
        tipo_plan_id: planSel.id,
        modoRenovacion: this.modoRenovacion(),
        fechaExacta: this.fechaExacta() || undefined,
        accion: tipoAccion,
        precioPagado: this.precioPagado(),
      };

      // 2. Disparamos la petición
      this.suscripcionServiceBackend.extenderSuscripcion(payload).subscribe({
        next: (res) => {
          this.toastService.show('Suscripción actualizada correctamente.', 'success');
          this.subscriptionService.close();
          
          this.adminStore.refrescarDatosBackoffice();
        },
        error: (err) => {
          const errorMsg = err.error?.error || 'Ocurrió un error interno al actualizar la suscripción.';
          this.toastService.show(errorMsg, 'error');
        }
      });
    }
  }

  private formatearFecha(fechaStr: string) {
    if (!fechaStr) return '';
    const [yyyy, mm, dd] = fechaStr.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
}
