import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { Icon } from 'src/app/shared/components/icon';
import { ContextMenuService, OpcionMenu } from 'src/app/shared/services/context-menu.service';
import { MenuPrincipalService } from 'src/app/shared/services/menu-principal.service';

@Component({
  selector: 'app-header-bo',
  imports: [CommonModule, Icon, RouterModule],
  templateUrl: './header-bo.html',
  styleUrl: './header-bo.css',
})
export class HeaderBo {
  public adminStore = inject(AdminStoreService);
  public contextMenu = inject(ContextMenuService);
  public menuPrincipal = inject(MenuPrincipalService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private authService = inject(AuthService);

  isInicio = signal<boolean>(true);
  tituloPagina = signal<string>('');

  constructor() {
    this.actualizarTitulo(this.router.url);
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.actualizarTitulo(event.urlAfterRedirects);
    });
  }

  private actualizarTitulo(url: string) {
    if (url.includes('/inicio')) {
      this.isInicio.set(true);
      this.tituloPagina.set('');
    } else {
      this.isInicio.set(false);
      
      if (url.includes('/vendedores')) this.tituloPagina.set('Vendedores');
      else if (url.includes('/catalogos')) this.tituloPagina.set('Catálogos');
      else this.tituloPagina.set('Panel');
    }
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

  volverAInicio() {
    this.router.navigate(['/backoffice/inicio']);
  }

  ejecutarOpcion(opcion: OpcionMenu) {
    opcion.action();
    this.contextMenu.isOpen.set(false);
  }
}
