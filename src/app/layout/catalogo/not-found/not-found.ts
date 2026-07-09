import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '@shared/components/icon';
import { isDominioBase } from 'src/app/core/data/domains.data';

@Component({
  selector: 'app-not-found',
  imports: [Icon],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  private router = inject(Router);

  volverAlInicio() {
    const host = window.location.hostname;

    if (isDominioBase(host)) {
      this.router.navigate(['/']); 
      return;
    }

    const partes = host.split('.');
    partes.shift(); 
    const dominioBase = partes.join('.'); 
    
    const protocolo = window.location.protocol;
    window.location.href = `${protocolo}//${dominioBase}`;
  }
}
