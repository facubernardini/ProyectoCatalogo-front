import { Component, effect, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule, Location } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CatalogoService } from 'src/app/core/services-backend/catalogo.ServiceBackend';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { Catalogo } from 'src/app/core/models/catalogo.model';
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
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);
  
  catalogo = signal<Catalogo | null>(null);
  loading = signal(false);

  haceEnvios = signal(false);
  costoEnvio = signal(0);
  envioGratisDesde = signal<number | null>(null);

  constructor() {
    effect(() => {
      const storeData = this.adminStore.catalogo();
      if (storeData && !this.catalogo()) {
        this.catalogo.set(JSON.parse(JSON.stringify(storeData)));
      }
    });
  }

  async guardarCambios(section: ConfigSection) {
    const dataActual = this.catalogo();

    if (!dataActual) {
      this.toastService.show('No hay datos para guardar', 'error');
      return;
    }
    
    this.loading.set(true);
    
    this.catalogoService.updateCatalogo(this.adminStore.catalogoId(), dataActual).subscribe({
      next: (res) => {
        this.adminStore.catalogo.set(res);
        this.catalogo = this.adminStore.catalogo;
        this.toastService.show('Sección actualizada');
        section.forceClose();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  resetearValores() {
    const dataOriginal = this.adminStore.catalogo;
    
    if (dataOriginal) {
      this.catalogo = dataOriginal;
    }
  }

  volverAtras() {
    this.location.back();
  }
}
