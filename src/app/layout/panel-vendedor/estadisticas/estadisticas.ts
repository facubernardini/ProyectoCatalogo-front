import { Component, signal } from '@angular/core';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-estadisticas',
  imports: [Icon],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas {
  mostrarBeneficios = signal<boolean>(false);
  
  toggleBeneficios() {
    this.mostrarBeneficios.update(v => !v);
  }
}
