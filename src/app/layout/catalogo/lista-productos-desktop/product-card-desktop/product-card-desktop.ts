import { Component, inject, input } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { ProductSelectorService } from '@shared/services/product-selector.service';

@Component({
  selector: 'app-product-card-desktop',
  imports: [Icon],
  templateUrl: './product-card-desktop.html',
  styleUrl: './product-card-desktop.css',
})
export class ProductCardDesktop {
  producto = input.required<Producto>();
  public productSelectorService = inject(ProductSelectorService)

  getMejorOferta(presentaciones: Presentacion[]): Presentacion | null {
    if (!presentaciones?.length) return null;
    return presentaciones.reduce((prev, curr) => {
      const precioPrev = prev.precio_descuento ?? prev.precio;
      const precioCurr = curr.precio_descuento ?? curr.precio;
      return Number(precioCurr) < Number(precioPrev) ? curr : prev;
    });
  }

  tieneOfertas(presentaciones: Presentacion[]): boolean {
    return presentaciones.some(p => p.precio_descuento !== null);
  }
}