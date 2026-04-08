import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-carrousel-destacados',
  imports: [CommonModule, Icon],
  templateUrl: './carrousel-destacados.html',
  styleUrl: './carrousel-destacados.css',
})
export class CarrouselDestacados {
  productosDestacados = input.required<Producto[]>();
}
