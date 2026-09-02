import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { Icon } from 'src/app/shared/components/icon';

@Component({
  selector: 'app-navbar-bo',
  imports: [CommonModule, RouterModule, Icon],
  templateUrl: './navbar-bo.html',
  styleUrl: './navbar-bo.css',
})
export class NavbarBo {
  private router = inject(Router);

  rutasNav = [
    '/backoffice/inicio',
    '/backoffice/vendedores',
    '/backoffice/catalogos',
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
    if (ruta === '/backoffice/inicio') {
      return this.router.url === ruta;
    }
    
    return this.router.url.includes(ruta);
  }
}
