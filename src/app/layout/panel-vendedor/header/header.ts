import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from 'src/app/shared/components/icon';
import { ContextMenuService, OpcionMenu } from 'src/app/shared/services/context-menu.service';
import { MenuPrincipalService } from 'src/app/shared/services/menu-principal.service';

@Component({
  selector: 'app-panel-header',
  imports: [CommonModule, Icon, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public adminStore = inject(AdminStoreService);
  public contextMenu = inject(ContextMenuService);
  public menuPrincipal = inject(MenuPrincipalService);
  private router = inject(Router);

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
      
      if (url.includes('/mis-pedidos')) this.tituloPagina.set('Mis Pedidos');
      else if (url.includes('/mis-productos')) this.tituloPagina.set('Mis Productos');
      else if (url.includes('/mis-categorias')) this.tituloPagina.set('Mis Categorías');
      else if (url.includes('/mis-cupones')) this.tituloPagina.set('Mis Cupones');
      else if (url.includes('/mi-tienda')) this.tituloPagina.set('Mi Tienda');
      else if (url.includes('/estadisticas')) this.tituloPagina.set('Estadísticas');
      else if (url.includes('/carga-inicial')) this.tituloPagina.set('Carga Inicial');
      else if (url.includes('/perfil')) this.tituloPagina.set('Mi Perfil');
      else this.tituloPagina.set('Panel');
    }
  }

  abrirMenuPrincipal() {
    this.menuPrincipal.open();
  }

  irAPerfil() {
    this.router.navigate(['/panel-vendedor/perfil']);
  }

  volverAInicio() {
    this.router.navigate(['/panel-vendedor/inicio']);
  }

  ejecutarOpcion(opcion: OpcionMenu) {
    opcion.action();
    this.contextMenu.isOpen.set(false);
  }
}
