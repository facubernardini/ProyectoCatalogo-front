import { Component, computed, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CartService } from '@shared/services/cart.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ProductosOfertasService } from '@shared/services/productos-ofertas.service';

@Component({
  selector: 'app-carousel-ofertas',
  imports: [Icon],
  templateUrl: './carousel-ofertas.html',
  styleUrl: './carousel-ofertas.css',
})
export class CarouselOfertas {
  public adminStore = inject(AdminStoreService);
  public productosOfertasService = inject(ProductosOfertasService);
  public productSelectorService = inject(ProductSelectorService);
  private cartService = inject(CartService);

  productosOferta = computed(() => 
    this.adminStore.productos().filter(p => 
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
}