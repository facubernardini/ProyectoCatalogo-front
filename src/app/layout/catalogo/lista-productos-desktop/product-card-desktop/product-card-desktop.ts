import { Component, inject, input, signal } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { SafeHtmlPipe } from "../../../../core/pipes/safe-html.pipe";

@Component({
  selector: 'app-product-card-desktop',
  imports: [Icon, SafeHtmlPipe],
  templateUrl: './product-card-desktop.html',
  styleUrl: './product-card-desktop.css',
})
export class ProductCardDesktop {
  producto = input.required<Producto>();
  public productSelectorService = inject(ProductSelectorService);

  public imageLoaded = signal(false);

  getMejorOferta(presentaciones: Presentacion[]): Presentacion | null {
    if (!presentaciones?.length) return null;
    return presentaciones.reduce((prev, curr) => {
      const precioPrev = prev.precio_descuento ?? prev.precio;
      const precioCurr = curr.precio_descuento ?? curr.precio;
      return Number(precioCurr) < Number(precioPrev) ? curr : prev;
    });
  }

  onImageLoad() {
    this.imageLoaded.set(true);
  }
}