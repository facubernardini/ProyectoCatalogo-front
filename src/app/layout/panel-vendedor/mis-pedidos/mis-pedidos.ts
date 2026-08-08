import { Component, inject } from '@angular/core';
import { Icon } from "src/app/shared/components/icon";
import { Location } from '@angular/common';

@Component({
  selector: 'app-mis-pedidos',
  imports: [Icon],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css',
})
export class MisPedidos {
  private location = inject(Location);

  volverAtras() {
    this.location.back();
  }
}
