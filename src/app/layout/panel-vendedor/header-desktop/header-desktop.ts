import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Icon } from 'src/app/shared/components/icon';
import { ContextMenuService, OpcionMenu } from 'src/app/shared/services/context-menu.service';

@Component({
  selector: 'app-header-desktop',
  imports: [CommonModule, Icon],
  templateUrl: './header-desktop.html',
  styleUrl: './header-desktop.css',
})
export class HeaderDesktop {
  public contextMenu = inject(ContextMenuService);
  private router = inject(Router);

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
    this.contextMenu.limpiar();
    
    this.tituloPagina.set(this.obtenerTitulo(url));
  }

  private obtenerTitulo(url: string): string {
    if (url.includes('inicio')) return 'Resumen General';
    if (url.includes('perfil')) return 'Mi Perfil';
    if (url.includes('mis-productos')) return 'Gestión de Productos';
    if (url.includes('mis-pedidos')) return 'Bandeja de Pedidos';
    if (url.includes('estadisticas')) return 'Estadísticas y Ventas';
    if (url.includes('mi-tienda')) return 'Configuración de la Tienda';
    if (url.includes('mis-cupones')) return 'Cupones de Descuento';
    if (url.includes('mis-categorias')) return 'Organización de Categorías';
    if (url.includes('carga-inicial')) return 'Importar productos desde Excel';
    
    return 'Panel Vendedor';
  }

  ejecutarOpcion(opcion: OpcionMenu) {
    opcion.action();
  }
}