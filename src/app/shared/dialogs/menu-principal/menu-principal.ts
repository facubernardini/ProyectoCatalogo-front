import { Component, inject } from '@angular/core';
import { MenuPrincipalService } from '../../services/menu-principal.service';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Router } from '@angular/router';
import { Icon } from "../../components/icon";
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { PdfExportService } from 'src/app/core/services/pdf-export.service';

@Component({
  selector: 'app-menu-principal',
  imports: [Icon],
  templateUrl: './menu-principal.html',
  styleUrl: './menu-principal.css',
})
export class MenuPrincipal {
  public menuService = inject(MenuPrincipalService);
  public adminStore = inject(AdminStoreService);
  public exportPDFService = inject(PdfExportService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private authService = inject(AuthService);

  navegar(ruta: string) {
    this.menuService.close();
    this.router.navigate([ruta]);
  }

  async onLogout() {
    const confirm = await this.confirmService.ask({
      title: '¿Cerrar sesión?',
      message: ``,
      icon: 'logout',
      type: 'info'
    });

    if (confirm) {
      this.menuService.close();
      this.authService.logout();
    }
  }
}
