import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { Catalogo } from 'src/app/core/models/catalogo.model';
import { Vendedor } from 'src/app/core/models/vendedor.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  imports: [Icon, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  public adminStore = inject(AdminStoreService);
  
  async onLogout() {
    const confirm = await this.confirmService.ask({
        title: '¿Cerrar sesión?',
        message: ``,
        icon: 'info',
        type: 'info'
      });

    if (confirm) {
      localStorage.removeItem('token');
      localStorage.removeItem('vendedor');
      window.location.href = '/login';
    }
  }

  verCatalogoPublico() {
    const slug = this.adminStore.catalogo()?.slug;
    if (slug) {
      window.open(`/${slug}`, '_blank');
    } else {
      this.toastService.show('Primero debés configurar el nombre de tu tienda', 'error');
    }
  }
}
