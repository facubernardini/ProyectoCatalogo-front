import { Component, inject } from '@angular/core';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductPreviewService } from 'src/app/core/services/product-preview.service';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-product-preview',
  imports: [SwipeDownDirective],
  templateUrl: './product-preview.html',
  styleUrl: './product-preview.css',
})
export class ProductPreview {
  public productPreviewService = inject(ProductPreviewService);

  onEdit(_t4: Producto) {
    throw new Error('Method not implemented.');
  }
}
