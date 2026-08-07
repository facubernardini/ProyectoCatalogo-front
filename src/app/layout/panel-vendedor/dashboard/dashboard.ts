import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
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
  private authService = inject(AuthService);
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
      this.authService.logout();
    }
  }

  verCatalogoPublico() {
    const slug = this.adminStore.catalogo()?.slug;
    
    if (slug) {
      const currentHost = window.location.hostname;
      const baseDomain = currentHost.replace('www.', '');
      const url = `https://${slug}.${baseDomain}`;
      
      window.open(url, '_blank');
    } else {
      this.toastService.show('Primero debés configurar el nombre de tu tienda', 'error');
    }
  }

  copiarLinkCatalogo() {
    const slug = this.adminStore.catalogo()?.slug;
    
    if (slug) {
      const currentHost = window.location.hostname;
      const baseDomain = currentHost.replace('www.', '');
      const url = `https://${slug}.${baseDomain}`;
      
      navigator.clipboard.writeText(url).then(() => {
        this.toastService.show('¡Enlace copiado al portapapeles!', 'success');
      }).catch(err => {
          console.error('Error al copiar el enlace: ', err);
          this.toastService.show('No se pudo copiar el enlace', 'error');
      });
    } else {
      this.toastService.show('Primero debés configurar el nombre de tu tienda', 'error');
    }
  }
}
