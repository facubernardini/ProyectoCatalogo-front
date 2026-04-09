import { Component, inject } from '@angular/core';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { ProductSelectorService } from 'src/app/core/services/product-selector.service';

@Component({
  selector: 'app-product-selector',
  imports: [SwipeDownDirective],
  templateUrl: './product-selector.html',
  styleUrl: './product-selector.css',
})
export class ProductSelector {
  public productSelectorService = inject(ProductSelectorService);
  
}
