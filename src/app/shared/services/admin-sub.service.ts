import { Injectable, signal } from '@angular/core';
import { PlanSuscripcion } from 'src/app/core/models/backoffice/suscripcion.model';
import { VendedorBackoffice } from 'src/app/core/models/backoffice/vendedorBackoffice.model';

@Injectable({
  providedIn: 'root'
})
export class AdminSubscriptionService {
  
  public isOpen = signal(false);
  
  public vendedorSeleccionado = signal<VendedorBackoffice | null>(null);
  public planesDisponibles = signal<PlanSuscripcion[]>([]);

  constructor() {
    window.addEventListener('popstate', () => {
      if (this.isOpen() && history.state?.modal !== 'admin-subscription-modal') {
        this.cerrarInterno();
      }
    });
  }

  open(vendedor: VendedorBackoffice, planes: PlanSuscripcion[]) {
    if (this.isOpen()) return;

    this.vendedorSeleccionado.set(vendedor);
    this.planesDisponibles.set(planes);
    
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
    history.pushState({ modal: 'admin-subscription-modal' }, '');
  }

  close() {
    this.cerrarInterno();
    if (history.state?.modal === 'admin-subscription-modal') {
      history.back();
    }
  }

  private cerrarInterno() {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    document.body.style.overflow = 'auto';
  }
}