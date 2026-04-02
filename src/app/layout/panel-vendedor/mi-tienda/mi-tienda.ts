import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Location } from '@angular/common';

@Component({
  selector: 'app-mi-tienda',
  imports: [Icon],
  templateUrl: './mi-tienda.html',
  styleUrl: './mi-tienda.css',
})
export class MiTienda {
  private location = inject(Location);

  volverAtras() {
    this.location.back();
  }
}
