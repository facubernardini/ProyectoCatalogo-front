import { Component, HostListener, inject, signal } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { LoadingSpinner } from "@shared/components/loading-spinner/loading-spinner";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { Toast } from "src/app/shared/components/toast/toast";
import { ConfirmDialog } from "@shared/dialogs/confirm-dialog/confirm-dialog";
import { HistorialSuscripciones } from "@shared/dialogs/historial-suscripciones/historial-suscripciones";
import { AdminSub } from "@shared/dialogs/admin-sub/admin-sub";
import { Title } from '@angular/platform-browser';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { NavbarBo } from "./navbar-bo/navbar-bo";
import { HeaderBo } from "./header-bo/header-bo";
import { MenuLateralBo } from "./menu-lateral-bo/menu-lateral-bo";
import { Icon } from "src/app/shared/components/icon";
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-backoffice',
  imports: [LoadingSpinner, RouterOutlet, Toast, ConfirmDialog, HistorialSuscripciones, AdminSub, NavbarBo, HeaderBo, MenuLateralBo, Icon],
  templateUrl: './backoffice.html',
  styleUrl: './backoffice.css',
})
export class Backoffice {
  public adminStore = inject(AdminStoreService);
  private router = inject(Router);

  isDesktop = signal(window.innerWidth >= 768);

  @HostListener('window:resize')
  onResize() {
    this.isDesktop.set(window.innerWidth >= 768);
  }

  ngOnInit() {
    this.adminStore.cargarDatosPanelBackoffice();
  }

  public tituloPanelActual = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.obtenerTitulo(this.router.url))
    ),
    { initialValue: this.obtenerTitulo(this.router.url) }
  );

  private obtenerTitulo(url: string): string {
    if (url.includes('inicio')) return 'Panel Principal';
    if (url.includes('vendedores')) return 'Panel Vendedores';
    if (url.includes('catalogos')) return 'Panel Catálogos';
    
    return 'Panel Administrador';
  }
}
