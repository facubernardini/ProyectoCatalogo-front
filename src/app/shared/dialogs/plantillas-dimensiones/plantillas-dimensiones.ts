import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisableNumberScrollDirective } from 'src/app/core/directives/disable-number-scroll.directive';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from '../../components/icon';
import { PlantillasDimensionesService } from '../../services/plantillas-dimensiones.service';
import { PlantillaDimensionDTO } from 'src/app/core/models/plantilla-dimension.model';

@Component({
  selector: 'app-plantillas-dimensiones',
  standalone: true,
  imports: [DisableNumberScrollDirective, Icon, CommonModule, FormsModule],
  templateUrl: './plantillas-dimensiones.html',
  styleUrl: './plantillas-dimensiones.css',
})
export class PlantillasDimensiones {
  public formService = inject(PlantillasDimensionesService);
  public adminStore = inject(AdminStoreService);
  private confirmService = inject(ConfirmService);

  async eliminar(plantilla: PlantillaDimensionDTO) {
    const confirmado = await this.confirmService.ask({
      title: '¿Eliminar empaque?',
      message: `Si eliminás "${plantilla.nombre}", los productos asociados a este empaque quedarán sin dimensiones y no podrán cotizarse por Correo Argentino hasta que les asignes uno nuevo.`,
      icon: 'trash',
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmado) {
      this.formService.delete(plantilla.id);
    }
  }
}