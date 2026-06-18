import { Component, computed, inject } from '@angular/core';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { DatePipe } from '@angular/common';

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

  // --- VENDEDORES ---
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
      if (!v.ultimo_ingreso) return true;
      
      const fechaUltimoIngreso = new Date(v.ultimo_ingreso);
      
      return fechaUltimoIngreso < haceUnaSemana;
    }).length;
  });

  vendedoresPorVencer = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const tresDiasEnMs = 3 * 24 * 60 * 60 * 1000;
    const limiteFecha = new Date(hoy.getTime() + tresDiasEnMs);

    return this.vendedores().filter(v => {
      if (!v.suscripcion || !v.suscripcion.fecha_fin) return false;
      
      if (v.suscripcion.estado === 'CANCELADA') {
          return false;
      }

      const fechaFinStr = v.suscripcion.fecha_fin.toString();
      const fechaSoloDia = fechaFinStr.split('T')[0];
      
      const fechaFinNormalizada = new Date(fechaSoloDia); 

      return fechaFinNormalizada <= limiteFecha && fechaFinNormalizada >= hoy; 
    });
  });

  ultimosLogueos = computed(() => {
      return this.vendedores()
          .filter(v => v.ultimo_ingreso)
          .sort((a, b) => {
              const fechaA = new Date(a.ultimo_ingreso!).getTime();
              const fechaB = new Date(b.ultimo_ingreso!).getTime();
              return fechaB - fechaA;
          })
          .slice(0, this.cantUltimosLogueos);
  });

  // --- PLANES SUSCRIPCION ---
  totalPrueba = computed(() => 
    this.vendedores().filter(v => v.suscripcion?.plan?.toLowerCase() === 'prueba').length
  );

  totalBase = computed(() => 
    this.vendedores().filter(v => v.suscripcion?.plan?.toLowerCase() === 'base').length
  );

  totalPremium = computed(() => 
    this.vendedores().filter(v => v.suscripcion?.plan?.toLowerCase() === 'premium').length
  );
  
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
