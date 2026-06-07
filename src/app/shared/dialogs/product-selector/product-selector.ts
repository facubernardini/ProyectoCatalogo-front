import { Component, inject } from '@angular/core';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { SafeHtmlPipe } from 'src/app/core/pipes/safe-html.pipe';

@Component({
  selector: 'app-product-selector',
  imports: [SwipeDownDirective, SafeHtmlPipe],
  templateUrl: './product-selector.html',
  styleUrl: './product-selector.css',
})
export class ProductSelector {
  public productSelectorService = inject(ProductSelectorService);
  
  getPorcentaje(precio_base: number, precio_descuento: number): number {
    if (!precio_descuento || precio_base <= 0) return 0;
    return Math.round(100 - (precio_descuento * 100 / precio_base));
  }

  tieneOfertas(presentaciones: Presentacion[]): boolean {
    return presentaciones.some(p => p.precio_descuento !== null);
  }
}
