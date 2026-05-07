import { Component, effect, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule, Location } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CatalogoService } from 'src/app/core/services-backend/catalogo.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { Catalogo, HorarioDia } from 'src/app/core/models/catalogo.model';
import { FormsModule } from '@angular/forms';
import { ConfigSection } from "./config-section/config-section";

@Component({
  selector: 'app-mi-tienda',
  imports: [Icon, FormsModule, CommonModule, ConfigSection],
  templateUrl: './mi-tienda.html',
  styleUrl: './mi-tienda.css',
})
export class MiTienda {
  private location = inject(Location);

  public adminStore = inject(AdminStoreService);
  private catalogoService = inject(CatalogoService);
  private toastService = inject(ToastService);
  
  catalogo = signal<Catalogo | null>(null);
  loading = signal(false);

  constructor() {
    effect(() => {
      const storeData = this.adminStore.catalogo();
      if (storeData && !this.catalogo()) {
        this.clonarDatosDesdeStore();
      }
    });
  }

  private clonarDatosDesdeStore() {
    const storeData = this.adminStore.catalogo();
    if (storeData) {
      const copia = structuredClone(storeData);
      
      if (!copia.horarios || !Array.isArray(copia.horarios) || copia.horarios.length === 0) {
        copia.horarios = this.getHorariosBase();
      }
      
      this.catalogo.set(copia);
    }
  }

  private getHorariosBase(): HorarioDia[] {
    const dias: HorarioDia['dia'][] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias.map(dia => ({
      dia,
      abierto: true,
      apertura: '09:00',
      cierre: '18:00'
    }));
  }

  async guardarCambios(section: ConfigSection) {
    const dataActual = this.catalogo();

    if (!dataActual) {
      this.toastService.show('No hay datos para guardar', 'error');
      return;
    }

    dataActual.minimo_compra = dataActual.minimo_compra || 0;

    const diasInvalidos = dataActual.horarios.filter(item => 
      item.abierto && item.apertura >= item.cierre
    );

    if (diasInvalidos.length > 0) {
      const nombresDias = diasInvalidos.map(d => d.dia).join(', ');
      this.toastService.show(
        `Revisá los horarios de: ${nombresDias}. El cierre debe ser después de la apertura.`, 
        'error'
      );
      return;
    }
    
    this.loading.set(true);
    
    this.catalogoService.updateCatalogo(this.adminStore.catalogoId(), dataActual).subscribe({
      next: (res) => {
        this.adminStore.catalogo.set(res);
        this.catalogo.set(structuredClone(res));
        this.toastService.show('Cambios guardados');
        section.forceClose();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  resetearValores() {
    this.clonarDatosDesdeStore();
  }

  volverAtras() {
    this.location.back();
  }
}
