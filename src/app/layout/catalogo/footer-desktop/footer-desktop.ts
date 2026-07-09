import { Component } from '@angular/core';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { isDominioBase } from 'src/app/core/data/domains.data';

@Component({
  selector: 'app-footer-desktop',
  imports: [],
  templateUrl: './footer-desktop.html',
  styleUrl: './footer-desktop.css',
})
export class FooterDesktop {
  public BRAND_DATA = BRAND_DATA;
  
  currentYear = new Date().getFullYear();

  private obtenerUrlBasePlataforma(): string {
    const host = window.location.hostname;
    const protocolo = window.location.protocol;
    const puerto = window.location.port ? `:${window.location.port}` : ''; 

    if (isDominioBase(host)) {
      return `${protocolo}//${host}${puerto}`;
    }

    const partes = host.split('.');
    partes.shift(); 
    const dominioBase = partes.join('.'); 

    return `${protocolo}//${dominioBase}${puerto}`;
  }

  irAHome() {
    const urlBase = this.obtenerUrlBasePlataforma();
    window.open(urlBase, '_blank');
  }

  irACreacion() {
    const urlBase = this.obtenerUrlBasePlataforma();
    window.open(`${urlBase}/register`, '_blank');
  }
}
