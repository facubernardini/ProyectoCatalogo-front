import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ProductosDestacadosService } from '@shared/services/productos-destacados.service';

@Component({
  selector: 'app-carousel-destacados',
  imports: [CommonModule, Icon],
  templateUrl: './carousel-destacados.html',
  styleUrl: './carousel-destacados.css',
})
export class CarouselDestacados {
  public adminStore = inject(AdminStoreService);
  public productosDestacadosService = inject(ProductosDestacadosService);

  productosDestacados = computed(() => 
    this.adminStore.productos().filter(p => p.destacado)
  );

  public productSelectorService = inject(ProductSelectorService);

  getMejorOferta(presentaciones: Presentacion[]): Presentacion | null {
    if (!presentaciones?.length) return null;

    return presentaciones.reduce((prev, curr) => {
      const precioPrev = prev.precio_descuento ?? prev.precio;
      const precioCurr = curr.precio_descuento ?? curr.precio;
      
      return Number(precioCurr) < Number(precioPrev) ? curr : prev;
    });
  }
}
