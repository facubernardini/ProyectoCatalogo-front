import { Injectable, inject, signal } from '@angular/core';
import { ToastService } from 'src/app/core/services/toast.service';
import { PlantillaDimensionDTO } from 'src/app/core/models/plantilla-dimension.model';
import { PlantillasDimensionesManagerService } from 'src/app/core/services/plantillas-dimensiones-manager.service';

@Injectable({ providedIn: 'root' })
export class PlantillasDimensionesService {
    private managerService = inject(PlantillasDimensionesManagerService);
    private toastService = inject(ToastService);

    isOpen = signal(false);
    vistaActual = signal<'lista' | 'formulario'>('lista');
    
    editingPlantilla = signal<PlantillaDimensionDTO | null>(null);

    formData = signal({
        nombre: '',
        peso_gr: null as number | null,
        alto_cm: null as number | null,
        ancho_cm: null as number | null,
        largo_cm: null as number | null,
    });

    openManager() {
        this.vistaActual.set('lista');
        this.isOpen.set(true);
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen.set(false);
        setTimeout(() => {
            this.resetForm();
            this.vistaActual.set('lista');
        }, 300);
        document.body.style.overflow = 'auto';
    }

    openCreate() {
        this.editingPlantilla.set(null);
        this.resetForm();
        this.isOpen.set(true);
        this.vistaActual.set('formulario');
    }

    openEdit(plantilla: PlantillaDimensionDTO) {
        this.editingPlantilla.set({ ...plantilla });
        this.mapearAlFormulario(plantilla);
        this.vistaActual.set('formulario');
    }

    volverALista() {
        this.vistaActual.set('lista');
        setTimeout(() => this.resetForm(), 500); 
    }

    private mapearAlFormulario(plantilla: PlantillaDimensionDTO) {
        this.formData.set({
            nombre: plantilla.nombre || '',
            peso_gr: plantilla.peso_gr > 0 ? plantilla.peso_gr : null,
            alto_cm: plantilla.alto_cm > 0 ? plantilla.alto_cm : null,
            ancho_cm: plantilla.ancho_cm > 0 ? plantilla.ancho_cm : null,
            largo_cm: plantilla.largo_cm > 0 ? plantilla.largo_cm : null,
        });
    }

    private resetForm() {
        this.editingPlantilla.set(null);
        this.formData.set({
            nombre: '', peso_gr: null, alto_cm: null, ancho_cm: null, largo_cm: null
        });
    }

    esValido(): boolean {
        const data = this.formData();
        return !!(
            data.nombre?.trim() && 
            data.peso_gr && data.peso_gr > 0 &&
            data.alto_cm && data.alto_cm > 0 &&
            data.ancho_cm && data.ancho_cm > 0 &&
            data.largo_cm && data.largo_cm > 0
        );
    }

    save() {
        if (!this.esValido()) {
            this.toastService.show('Completá todos los campos con valores mayores a cero.', 'error');
            return;
        }

        const data = this.formData();
        const payload = {
            nombre: data.nombre.trim(),
            peso_gr: data.peso_gr,
            alto_cm: data.alto_cm,
            ancho_cm: data.ancho_cm,
            largo_cm: data.largo_cm
        };

        this.managerService.guardar(payload, this.editingPlantilla());
        this.volverALista();
    }

    delete(id: number) {
        this.managerService.eliminar(id);
    }
}