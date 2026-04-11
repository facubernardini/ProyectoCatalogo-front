import { Component, computed, inject, input } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { ProductSelectorService } from 'src/app/core/services/product-selector.service';
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-carousel-ofertas',
  imports: [Icon],
  templateUrl: './carousel-ofertas.html',
  styleUrl: './carousel-ofertas.css',
})
export class CarouselOfertas {
  productosRaw = input.required<Producto[]>();

  public productSelectorService = inject(ProductSelectorService);
  private cartService = inject(CartService);

  productosOferta = computed(() => 
    this.productosRaw().filter(p => 
      p.presentaciones.some(pres => pres.precio_descuento && pres.precio_descuento > 0)
    )
  );

  getMejorOferta(presentaciones: Presentacion[]): Presentacion | null {
    if (!presentaciones || presentaciones.length === 0) return null;

    const ofertas = presentaciones.filter(p => p.precio_descuento !== null);
    
    if (ofertas.length === 0) return null;

    return ofertas.reduce((min, p) => 
      Number(p.precio_descuento) < Number(min.precio_descuento) ? p : min
    );
  }

  manejarClickOferta(producto: Producto) {
    const presentacionesEnOferta = producto.presentaciones.filter(
      p => p.precio_descuento !== null
    );

    if (presentacionesEnOferta.length === 1) {
      this.cartService.agregarProducto(producto, presentacionesEnOferta[0]);
    } else if (presentacionesEnOferta.length > 1) {
      this.productSelectorService.open(producto);
    }
  }
}