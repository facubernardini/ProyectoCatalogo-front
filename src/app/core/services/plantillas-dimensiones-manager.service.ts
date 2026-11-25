import { inject, Injectable, signal } from '@angular/core';
import { AdminStoreService } from './admin-store.service';
import { ToastService } from './toast.service';
import { finalize } from 'rxjs';
import { PlantillaDimensionDTO } from '../models/plantilla-dimension.model';
import { PlantillasDimensionesServiceBackend } from '../services-backend/plantillas-dimensiones.ServiceBackend';

@Injectable({ providedIn: 'root' })
export class PlantillasDimensionesManagerService {
  private apiBackend = inject(PlantillasDimensionesServiceBackend);
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);

  public isLoading = signal(false);

  // --- CREAR O EDITAR ---
  guardar(plantillaData: any, currentPlantilla?: PlantillaDimensionDTO | null) {
    const catalogoId = this.adminStore.catalogo()?.id;

    if (!catalogoId) {
      this.toastService.show('Ocurrió un error inesperado al obtener tu tienda', 'error');
      return;
    }

    const proceso = this.toastService.loading(currentPlantilla ? 'Actualizando empaque...' : 'Creando empaque...');

    this.isLoading.set(true);

    const finalData = { 
      ...plantillaData,
      catalogo_id: catalogoId 
    };

    const request = currentPlantilla && currentPlantilla.id
      ? this.apiBackend.updatePlantilla(currentPlantilla.id, finalData)
      : this.apiBackend.createPlantilla(finalData);

    request.pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        if (currentPlantilla) {
          this.adminStore.updatePlantillaEnLista(res);
          proceso.success('Empaque actualizado');
        } else {
          this.adminStore.agregarPlantillaALista(res);
          proceso.success('Empaque creado con éxito');
        }
      },
      error: (err) => {
        console.error('Error al guardar empaque:', err);
        const mensajeError = err.error?.mensaje || 'Hubo un error al guardar el empaque';
        proceso.error(mensajeError);
      }
    });
  }

  // --- ELIMINAR ---
  eliminar(id: number) {
    const proceso = this.toastService.loading('Eliminando empaque...');

    this.isLoading.set(true);
    
    this.apiBackend.deletePlantilla(id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        this.adminStore.eliminarPlantillaDeLista(id);
        proceso.success('Empaque eliminado con éxito');
      },
      error: (err) => {
        console.error('Error al eliminar empaque:', err);
        const mensajeError = err.error?.mensaje || 'No se pudo eliminar el empaque';
        proceso.error(mensajeError);
      }
    });
  }
}