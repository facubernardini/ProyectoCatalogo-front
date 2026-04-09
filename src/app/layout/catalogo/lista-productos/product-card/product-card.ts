import { Component, inject, input } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { ProductSelectorService } from 'src/app/core/services/product-selector.service';

@Component({
  selector: 'app-product-card',
  imports: [Icon],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  producto = input.required<Producto>();

  public productSelectorService = inject(ProductSelectorService)
}
