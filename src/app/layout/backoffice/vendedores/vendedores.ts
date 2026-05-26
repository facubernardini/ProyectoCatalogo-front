import { Component, inject, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-vendedores',
  imports: [DatePipe, UpperCasePipe, Icon],
  templateUrl: './vendedores.html',
  styleUrl: './vendedores.css',
})
export class Vendedores {
  private adminStore = inject(AdminStoreService);

  vendedores = this.adminStore.vendedoresBackoffice;

  menuAbiertoId = signal<number | null>(null);

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    if (this.menuAbiertoId() === id) {
      this.menuAbiertoId.set(null);
    } else {
      this.menuAbiertoId.set(id);
    }
  }

  suspenderReactivar(vendedor: any) {
    this.menuAbiertoId.set(null);
    console.log(`Cambiando estado de: ${vendedor.nombre_apellido}`);
    // Acá llamás a tu servicio: this.vendedorService.toggleEstado(vendedor.id)...
  }

  administrarSuscripcion(vendedor: any) {
    this.menuAbiertoId.set(null);
    console.log(`Administrando suscripción de: ${vendedor.nombre_apellido}`);
    // Acá podrías abrir un modal o redirigir: this.router.navigate([...])
  }

  // Escucha clics fuera del menú para cerrarlo (opcional pero recomendado)
  // Agregá (document:click)="cerrarMenuGlobal()" en el contenedor principal o usá un HostListener
  cerrarMenuGlobal() {
    this.menuAbiertoId.set(null);
  }
}
