import { Component, inject, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { HistorialSuscripcionesService } from '@shared/services/historial-suscripciones.service';
import { VendedorService } from 'src/app/core/services-backend/vendedores.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';

@Component({
  selector: 'app-vendedores',
  imports: [DatePipe, UpperCasePipe, Icon],
  templateUrl: './vendedores.html',
  styleUrl: './vendedores.css',
})
export class Vendedores {
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private vendedorService = inject(VendedorService);
  private historialSuscripcionesService = inject(HistorialSuscripcionesService);

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

  async suspenderReactivar(vendedor: any) {
    this.menuAbiertoId.set(null);

    const esActivo = vendedor.activo;
    const accionTitulo = esActivo ? 'Suspender' : 'Reactivar';
    
    const mensajeAmigable = esActivo 
      ? `Estás por deshabilitar el acceso a la plataforma para ${vendedor.nombre_apellido}. Sus catálogos dejarán de ser visibles.`
      : `Estás por habilitar nuevamente el acceso a la plataforma para ${vendedor.nombre_apellido}.`;

    const confirm = await this.confirmService.ask({
      title: `¿${accionTitulo} cuenta?`,
      message: mensajeAmigable,
      icon: 'warning',
      type: 'warning'
    });

    if (confirm) {
      this.vendedorService.cambiarEstadoVendedor(vendedor.id).subscribe({
        next: (respuesta) => {
          this.adminStore.updateVendedorEnLista({
            id: vendedor.id,
            activo: respuesta.vendedor.activo
          });
          
          const resultadoTxt = respuesta.vendedor.activo ? 'reactivado' : 'suspendido';
          this.toastService.show(`Vendedor ${resultadoTxt} con éxito`, 'success');
        },
        error: (err) => {
          console.error('Error al intentar cambiar el estado:', err);
          this.toastService.show(`Error al actualizar el estado del vendedor`, 'error');
        }
      });
    }
  }

  administrarSuscripcion(vendedor: any) {
    this.menuAbiertoId.set(null);
    console.log(`Administrando suscripción de: ${vendedor.nombre_apellido}`);
    // Acá podrías abrir un modal o redirigir: this.router.navigate([...])
  }

  abrirHistorial(vendedorId: number) {
    this.menuAbiertoId.set(null);
    this.historialSuscripcionesService.open(vendedorId);
  }

  cerrarMenuGlobal() {
    this.menuAbiertoId.set(null);
  }
}
