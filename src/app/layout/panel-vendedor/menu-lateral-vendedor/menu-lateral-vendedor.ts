import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { PdfExportService } from 'src/app/core/services/pdf-export.service';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-menu-lateral-vendedor',
  imports: [Icon],
  templateUrl: './menu-lateral-vendedor.html',
  styleUrl: './menu-lateral-vendedor.css',
})
export class MenuLateralVendedor {
  public adminStore = inject(AdminStoreService);
  public exportPDFService = inject(PdfExportService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private authService = inject(AuthService);

  irAMiPerfil() {
    this.router.navigate(['/panel-vendedor/perfil']);
  }

  contactarSoporte() {
    const numeroLimpio = BRAND_DATA.contact.whatsapp.replace(/\D/g, '');
    
    const mensaje = encodeURIComponent('Hola, necesito ayuda con mi tienda.');
    
    const url = `https://wa.me/${numeroLimpio}?text=${mensaje}`;
    
    window.open(url, '_blank');
  }

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