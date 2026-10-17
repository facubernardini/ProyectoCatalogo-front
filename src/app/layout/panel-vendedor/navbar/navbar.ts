import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-panel-navbar',
  imports: [CommonModule, RouterModule, Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class PanelNavbar {
  public authService = inject(AuthService);
  private router = inject(Router);

  // 1. Arreglo estricto para el plan básico (4 elementos)
  private rutasBasico = [
    '/panel-vendedor/inicio',
    '/panel-vendedor/mis-productos',
    '/panel-vendedor/mis-categorias',
    '/panel-vendedor/mi-tienda'
  ];

  // 2. Arreglo estricto para planes superiores (5 elementos)
  private rutasPremium = [
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
    this.rutaActualEvent(); // Dispara la reactividad en cada cambio de ruta
    const urlActual = this.router.url;
    
    // 3. Elegimos el arreglo correcto según el plan
    const rutasActuales = this.authService.esPlanBasico() 
      ? this.rutasBasico 
      : this.rutasPremium;
    
    return rutasActuales.findIndex(ruta => urlActual.includes(ruta));
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