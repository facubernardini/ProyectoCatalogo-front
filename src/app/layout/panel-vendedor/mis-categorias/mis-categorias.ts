import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Location } from '@angular/common';

@Component({
  selector: 'app-mis-categorias',
  imports: [Icon],
  templateUrl: './mis-categorias.html',
  styleUrl: './mis-categorias.css',
})
export class MisCategorias {
  private location = inject(Location);

  volverAtras() {
    this.location.back();
  }
}
