import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Icon } from 'src/app/shared/components/icon';
import { ProductImportPreviewService } from '../../services/product-import-preview.service';
import { ProductoImportado } from 'src/app/core/models/carga-masiva.model';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';

@Component({
  selector: 'app-product-import-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, SwipeDownDirective],
  templateUrl: './product-import-preview.html'
})
export class ProductImportPreview {
  
  public previewService = inject(ProductImportPreviewService);

  onFocus(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }

  agregarPresentacion(producto: ProductoImportado) {
    producto.presentaciones.push({
      unidad_venta: '',
      precio: 0
    });
  }

  eliminarPresentacion(producto: ProductoImportado, index: number) {
    if (producto.presentaciones.length > 1) {
      producto.presentaciones.splice(index, 1);
    }
  }

  datosInvalidos(producto: ProductoImportado): boolean {
    if (!producto.nombre?.trim()) return true;
    if (!producto.categoria?.trim()) return true;
    
    if (producto.presentaciones.length === 0) return true;
    
    return producto.presentaciones.some(p => 
      !p.unidad_venta?.trim() || 
      p.precio === null || p.precio === undefined || p.precio <= 0
    );
  }

  onGuardar(producto: ProductoImportado) {
    this.previewService.saveChanges();
  }
}