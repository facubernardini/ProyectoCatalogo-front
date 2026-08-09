import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-panel-navbar',
  imports: [CommonModule, RouterModule, Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class PanelNavbar {

  private router = inject(Router);

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
