import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { ProductPreviewService } from '@shared/services/product-preview.service';

@Component({
  selector: 'app-product-preview',
  imports: [SwipeDownDirective, FormsModule, Icon],
  templateUrl: './product-preview.html',
  styleUrl: './product-preview.css',
})
export class ProductPreview {
  public productPreviewService = inject(ProductPreviewService);

  preciosInvalidos(producto: Producto): boolean {
    if (!producto || !producto.presentaciones) return false;
    
    return producto.presentaciones.some(p => 
      p.precio_descuento !== null && 
      p.precio_descuento !== undefined && 
      p.precio_descuento > 0 &&
      Number(p.precio_descuento) >= Number(p.precio)
    );
  }

  agregarPresentacion(producto: Producto) {
    if (!producto.presentaciones) {
      producto.presentaciones = [];
    }
    producto.presentaciones.push({
      id: 0,
      producto_id: producto.id,
      unidad_venta: '',
      precio: null as any,
      precio_descuento: null,
      stock: 0,
      activo: true
    });
  }

  eliminarPresentacion(producto: Producto, index: number) {
    producto.presentaciones.splice(index, 1);
  }

  datosInvalidos(producto: Producto): boolean {
    if (!producto || !producto.presentaciones || producto.presentaciones.length === 0) return true;
    
    return producto.presentaciones.some(p => 
      !p.unidad_venta || p.unidad_venta.toString().trim() === '' ||
      p.precio === null || p.precio === undefined || p.precio.toString().trim() === '' || Number(p.precio) <= 0 ||
      (p.precio_descuento !== null && p.precio_descuento !== undefined && p.precio_descuento !== '' as any && Number(p.precio_descuento) > Number(p.precio))
    );
  }

  onGuardar(prod: Producto) {
    if (this.preciosInvalidos(prod)) return;
    
    this.productPreviewService.onGuardar(prod);
  }
}
