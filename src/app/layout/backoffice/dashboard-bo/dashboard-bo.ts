import { Component, computed, inject } from '@angular/core';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { DatePipe } from '@angular/common';
import { SuscripcionEstado } from 'src/app/shared/enums/suscripcion.enum';

@Component({
  selector: 'app-dashboard-bo',
  imports: [Icon, DatePipe],
  templateUrl: './dashboard-bo.html',
  styleUrl: './dashboard-bo.css',
})
export class DashboardBO {
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService);
  private adminStore = inject(AdminStoreService);

  vendedores = this.adminStore.vendedoresBackoffice;
  diasInactividad: number = 7;
  cantUltimosLogueos: number = 3;

  totalVendedores = computed(() => this.vendedores().length);

  vendedoresActivos = computed(() => 
    this.vendedores().filter(v => v.activo).length
  );

  vendedoresInactivos = computed(() => {
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(haceUnaSemana.getDate() - this.diasInactividad);

    return this.vendedores().filter(v => {
      if (!v.ultimo_login) return true;
      
      const fechaUltimoIngreso = new Date(v.ultimo_login);
      
      return fechaUltimoIngreso < haceUnaSemana;
    }).length;
  });

  vendedoresPendientesPago = computed(() => {
    return this.vendedores().filter(v => v.suscripcion?.estado === SuscripcionEstado.PENDIENTE_PAGO);
  });

  ultimosLogueos = computed(() => {
    return this.vendedores()
      .filter(v => v.ultimo_login)
      .sort((a, b) => {
        const fechaA = new Date(a.ultimo_login!).getTime();
        const fechaB = new Date(b.ultimo_login!).getTime();
        return fechaB - fechaA;
      })
      .slice(0, this.cantUltimosLogueos);
  });

  ultimasActividades = computed(() => {
    return this.vendedores()
      .filter(v => v.ultima_actividad)
      .sort((a, b) => {
        const fechaA = new Date(a.ultima_actividad!).getTime();
        const fechaB = new Date(b.ultima_actividad!).getTime();
        return fechaB - fechaA;
      })
      .slice(0, this.cantUltimosLogueos);
  });

  // --- PLANES SUSCRIPCION ---
  totalPrueba = computed(() => 
    this.vendedores().filter(v => v.suscripcion?.tipo_plan?.toLowerCase() === 'prueba').length
  );

  totalBase = computed(() => 
    this.vendedores().filter(v => v.suscripcion?.tipo_plan?.toLowerCase() === 'base').length
  );

  totalPremium = computed(() => 
    this.vendedores().filter(v => v.suscripcion?.tipo_plan?.toLowerCase() === 'premium').length
  );

  diasParaOcultarTienda(fechaFin: string | Date | undefined): { dias: number; texto: string; expirado: boolean } {
    if (!fechaFin) return { dias: 0, texto: 'Fecha no válida', expirado: true };

    const fechaVencimiento = new Date(fechaFin);
    // Fecha límite: vencimiento + 10 días
    const fechaLimite = new Date(fechaVencimiento.getTime() + 10 * 24 * 60 * 60 * 1000);
    const ahora = new Date();

    const diferenciaMs = fechaLimite.getTime() - ahora.getTime();
    const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diasRestantes <= 0) {
      return { dias: 0, texto: 'Tienda oculta', expirado: true };
    } else if (diasRestantes === 1) {
      return { dias: 1, texto: 'Se oculta hoy', expirado: false };
    } else {
      return { dias: diasRestantes, texto: `Se oculta en ${diasRestantes}d`, expirado: false };
    }
  }
  
  async onLogout() {
    const confirm = await this.confirmService.ask({
      title: '¿Cerrar sesión?',
      message: ``,
      icon: 'info',
      type: 'info'
    });

    if (confirm) {
      this.authService.logout();
    }
  }
}
