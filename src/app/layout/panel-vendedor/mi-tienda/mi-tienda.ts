import { Component, computed, effect, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule, Location } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CatalogoService } from 'src/app/core/services-backend/catalogo.ServiceBackend';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { Catalogo, HorarioSemana } from 'src/app/core/models/catalogo.model';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mi-tienda',
  imports: [Icon, FormsModule, CommonModule],
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

  constructor() {
    // 2. Sincronización: Cuando el Store tenga el catálogo, hacemos la copia local
    effect(() => {
      const storeData = this.adminStore.catalogo();
      if (storeData && !this.catalogo()) {
        // Clonamos para evitar mutar el Store global por referencia
        this.catalogo.set(JSON.parse(JSON.stringify(storeData)));
        this.inicializarHorariosSiVacio();
      }
    });
  }

  // Validación básica del formulario
  formularioValido = computed(() => {
    const c = this.catalogo();
    if (!c) return false;
    return c.nombre_tienda.trim().length > 2 && (c.wpp_numero?.length ?? 0) > 5;
  }); 

  private inicializarHorariosSiVacio() {
    const actual = this.catalogo();
    if (!actual) return;

    // Verificamos si 'actual' existe y si 'horarios' es undefined o null
    if (!actual?.horarios || actual.horarios.length === 0) {
      const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      const defaultHorarios: HorarioSemana[] = dias.map(d => ({ dia: d, horas: '09:00 - 18:00' }));
      
      this.catalogo.update(c => c ? ({ 
        ...c, 
        horarios: defaultHorarios 
      }) : null);
    }
  }

  async guardarCambios() {
    // 1. Extraemos el valor actual a una constante
    const catalogoActual = this.catalogo();
    
    // 2. Cláusula de guarda: si no hay datos, salimos de la función
    if (!catalogoActual) return;

    const confirmacion = await this.confirmService.ask({
      title: '¿Guardar cambios?',
      message: 'La configuración de tu tienda se actualizará inmediatamente.',
      confirmText: 'Sí, guardar',
      cancelText: 'Volver',
      icon: 'save',
      type: 'info'
    });

    if (!confirmacion) return;

    this.loading.set(true);
    
    // 3. Ahora usamos 'catalogoActual'. TypeScript sabe que aquí NO es null,
    // por lo que te permite acceder a .id sin problemas.
    this.catalogoService.updateCatalogo(catalogoActual.id, catalogoActual)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (catalogoActualizado) => {
          this.catalogo.set(catalogoActualizado);
          this.toastService.show('Configuración guardada con éxito');
        },
        error: (err) => {
          console.error('Error al actualizar catálogo:', err);
          this.toastService.show('Error al guardar los cambios', 'error');
        }
      });
  }

  volverAtras() {
    this.location.back();
  }
}
