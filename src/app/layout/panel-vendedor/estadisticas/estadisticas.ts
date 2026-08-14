import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-estadisticas',
  imports: [],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas {
  mostrarBeneficios = signal<boolean>(false);
  
  toggleBeneficios() {
    this.mostrarBeneficios.update(v => !v);
  }
}
