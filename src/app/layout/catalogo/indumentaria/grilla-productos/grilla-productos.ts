import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { ProductCardIndumentaria } from '../product-card-indumentaria/product-card-indumentaria';

@Component({
  selector: 'app-grilla-productos',
  standalone: true,
  imports: [CommonModule, ProductCardIndumentaria, Icon],
  templateUrl: './grilla-productos.html',
})
export class GrillaProductos {
  titulo = input.required<string>();
  productos = input.required<Producto[]>();

  isFiltrosOpen = signal(false);

  toggleFiltros() {
    this.isFiltrosOpen.set(!this.isFiltrosOpen());
    if (this.isFiltrosOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}