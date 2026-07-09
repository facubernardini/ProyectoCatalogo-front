import { Injectable, computed, inject, signal } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Injectable({
  providedIn: 'root'
})
export class HistorialSuscripcionesService {
  private adminStore = inject(AdminStoreService);

  isOpen = signal<boolean>(false);
  private vendedorId = signal<number | null>(null);

  historialDelVendedor = computed(() => {
    const id = this.vendedorId();
    if (!id) return [];
    
    return this.adminStore.suscripcionesHistorialBackoffice().filter(h => h.vendedor_id === id);
  });

  open(id: number) {
    this.vendedorId.set(id);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.vendedorId.set(null);
		document.body.style.overflow = 'auto';
  }
}