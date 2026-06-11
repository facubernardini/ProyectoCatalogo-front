import { Component } from '@angular/core';

@Component({
  selector: 'app-confeti',
  imports: [],
  templateUrl: './confeti.html',
  styleUrl: './confeti.css',
})
export class Confeti {
  private colores = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Generamos 75 papelitos con posiciones, colores y tiempos aleatorios
  public particulas = Array.from({ length: 75 }).map(() => ({
    left: Math.random() * 100,
    color: this.colores[Math.floor(Math.random() * this.colores.length)],
    delay: Math.random() * 2000,
    duration: 2500 + Math.random() * 2000
  }));
}
