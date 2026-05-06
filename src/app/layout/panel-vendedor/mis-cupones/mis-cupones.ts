import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Icon } from "@shared/components/icon";
import { Cupon } from 'src/app/core/models/cupon.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-cupones',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './mis-cupones.html',
  styleUrl: './mis-cupones.css',
})
export class MisCupones {
  private location = inject(Location);

  filtro = signal('');
  estadoFiltro = signal('todos');
  cupones = signal<Cupon[]>([]); // Aquí vendrían de tu servicio

  // Lógica de filtrado
  cuponesFiltrados = computed(() => {
    let filtrados = this.cupones().filter(c => 
      c.codigo.toLowerCase().includes(this.filtro().toLowerCase())
    );

    if (this.estadoFiltro() === 'activos') filtrados = filtrados.filter(c => c.activo);
    if (this.estadoFiltro() === 'pausados') filtrados = filtrados.filter(c => !c.activo);
    // Agrega lógica para 'expirados' comparando fechas si es necesario
    
    return filtrados;
  });

  onAdd() {
    // Abriría el diálogo que configuraremos abajo
  }

  onEdit(cupon: Cupon) {
    // Carga los datos en el formulario
  }

  async onDelete(id: number) {
    // Llamada a tu ConfirmService
  }

  volverAtras() {
    this.location.back();
  }
}
