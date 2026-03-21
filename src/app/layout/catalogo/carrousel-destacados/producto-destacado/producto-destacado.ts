import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Product } from 'src/app/core/models/product.model';

@Component({
  selector: 'app-producto-destacado',
  imports: [CurrencyPipe, Icon],
  templateUrl: './producto-destacado.html',
  styleUrl: './producto-destacado.css',
})
export class ProductoDestacado {
  product = input.required<Product>();
}
