import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { ProductSelectorService } from 'src/app/core/services/product-selector.service';
import { Presentacion } from 'src/app/core/models/presentacion.model';

@Component({
  selector: 'app-carousel-destacados',
  imports: [CommonModule, Icon],
  templateUrl: './carousel-destacados.html',
  styleUrl: './carousel-destacados.css',
})
export class CarouselDestacados {
  productosDestacados = input.required<Producto[]>();

  public productSelectorService = inject(ProductSelectorService);

  getMejorOferta(presentaciones: Presentacion[]): Presentacion | null {
    if (!presentaciones?.length) return null;

    return presentaciones.reduce((prev, curr) => {
      const precioPrev = prev.precio_descuento ?? prev.precio;
      const precioCurr = curr.precio_descuento ?? curr.precio;
      
      return Number(precioCurr) < Number(precioPrev) ? curr : prev;
    });
  }
}
