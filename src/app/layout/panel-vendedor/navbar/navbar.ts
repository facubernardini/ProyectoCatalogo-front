import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-panel-navbar',
  imports: [CommonModule, RouterModule, Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class PanelNavbar {

  private router = inject(Router);

  rutasNav = [
    '/panel-vendedor/inicio',
    '/panel-vendedor/mis-productos',
    '/panel-vendedor/mis-pedidos',
    '/panel-vendedor/estadisticas',
    '/panel-vendedor/mi-tienda'
  ];

  private rutaActualEvent = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
  );

  indiceActivo = computed(() => {
    this.rutaActualEvent(); 
    const urlActual = this.router.url;
    
    return this.rutasNav.findIndex(ruta => urlActual.includes(ruta));
  });

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  esRutaActiva(ruta: string): boolean {
    if (ruta === '/panel-vendedor/inicio') {
      return this.router.url === ruta;
    }
    
    return this.router.url.includes(ruta);
  }
}
