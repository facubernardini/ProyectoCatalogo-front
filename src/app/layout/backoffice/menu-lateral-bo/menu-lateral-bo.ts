import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { Icon } from 'src/app/shared/components/icon';

@Component({
  selector: 'app-menu-lateral-bo',
  imports: [Icon],
  templateUrl: './menu-lateral-bo.html',
  styleUrl: './menu-lateral-bo.css',
})
export class MenuLateralBo {
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private authService = inject(AuthService);

  async onLogout() {
    const confirm = await this.confirmService.ask({
      title: '¿Cerrar sesión?',
      message: ``,
      icon: 'logout',
      type: 'info'
    });

    if (confirm) {
      this.authService.logout();
    }
  }

  esRutaActiva(ruta: string): boolean {
    if (ruta === '/panel-vendedor/inicio') {
      return this.router.url === ruta;
    }
    
    return this.router.url.includes(ruta);
  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }
}
