import { Component, inject } from '@angular/core';
import { ProductFormService } from 'src/app/core/services/product-form.service';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-product-form',
  imports: [Icon],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  public formService = inject(ProductFormService);

  guardar() {
    this.formService.close();
  }
}
