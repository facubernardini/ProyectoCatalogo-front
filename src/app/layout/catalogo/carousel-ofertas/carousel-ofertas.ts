import { Component, computed, inject, input } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { ProductSelectorService } from 'src/app/core/services/product-selector.service';

@Component({
  selector: 'app-carousel-ofertas',
  imports: [Icon],
  templateUrl: './carousel-ofertas.html',
  styleUrl: './carousel-ofertas.css',
})
export class CarouselOfertas {
  productosRaw = input.required<Producto[]>();

  public productSelectorService = inject(ProductSelectorService);

  productosOferta = computed(() => 
    this.productosRaw().filter(p => 
      p.presentaciones.some(pres => pres.porcentaje_descuento && pres.porcentaje_descuento > 0)
    )
    
  );
}