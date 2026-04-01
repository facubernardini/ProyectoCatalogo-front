import { Component, input } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Producto } from 'src/app/core/models/producto.model';

@Component({
  selector: 'app-producto-destacado',
  imports: [Icon],
  templateUrl: './producto-destacado.html',
  styleUrl: './producto-destacado.css',
})
export class ProductoDestacado {
  product = input.required<Producto>();
}
