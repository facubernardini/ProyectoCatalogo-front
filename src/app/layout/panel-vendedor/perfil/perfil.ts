import { Component, computed, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { DatePipe, Location } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';

@Component({
  selector: 'app-perfil',
  imports: [Icon, DatePipe],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  public adminStore = inject(AdminStoreService);
  private confirmService = inject(ConfirmService);
  private authService = inject(AuthService);
  private location = inject(Location);

  diasRestantes = computed(() => {
    const fechaFin = this.adminStore.vendedor()?.suscripcion?.fecha_fin;
    if (!fechaFin) return null;

    const hoy = new Date();
    const fin = new Date(fechaFin);

    hoy.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const diferenciaMs = fin.getTime() - hoy.getTime();
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    
    return dias;
  });

  volverAtras() {
    this.location.back();
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
