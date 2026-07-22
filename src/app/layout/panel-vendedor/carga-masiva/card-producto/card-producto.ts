import { Component, inject, input } from '@angular/core';
import { ProductoImportado } from 'src/app/core/models/carga-masiva.model';
import { CargaMasivaService } from 'src/app/core/services/carga-masiva.service';
import { Icon } from "src/app/shared/components/icon";
import { ProductImportPreviewService } from 'src/app/shared/services/product-import-preview.service';

@Component({
  selector: 'app-card-producto',
  imports: [Icon],
  templateUrl: './card-producto.html',
  styleUrl: './card-producto.css',
})
export class CardProducto {
  public producto = input.required<ProductoImportado>();

  private editorModalService = inject(ProductImportPreviewService);
  private cargaMasivaService = inject(CargaMasivaService);

  onEdit() {
    this.editorModalService.open(this.producto(), (original, productoEditado) => {
      this.cargaMasivaService.updateProductoIndividual(original, productoEditado);
    });
  }
}
