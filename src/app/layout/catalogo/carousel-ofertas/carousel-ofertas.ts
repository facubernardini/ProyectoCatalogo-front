import { Component, computed, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { Producto } from 'src/app/core/models/producto.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ProductosOfertasService } from '@shared/services/productos-ofertas.service';
import { SafeHtmlPipe } from "../../../core/pipes/safe-html.pipe";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel-ofertas',
  imports: [CommonModule, Icon, SafeHtmlPipe],
  templateUrl: './carousel-ofertas.html',
  styleUrl: './carousel-ofertas.css',
})
export class CarouselOfertas {
  public adminStore = inject(AdminStoreService);
  public productosOfertasService = inject(ProductosOfertasService);
  public productSelectorService = inject(ProductSelectorService);
  
  public imageLoaded = signal(false);

  productosOferta = computed(() => {
    const productosConOferta = this.adminStore.productos().filter(p => 
      p.presentaciones.some(pres => pres.precio_descuento && pres.precio_descuento > 0)
    );

    const permiteVentaSinStock = this.adminStore.catalogo()?.permitir_ventas_sin_stock ?? false;

    if (permiteVentaSinStock) {
      return productosConOferta;
    }

    const conStock = productosConOferta.filter(p => {
      const ofertas = p.presentaciones.filter(pres => pres.precio_descuento && pres.precio_descuento > 0);
      return ofertas.some(pres => pres.stock === null || pres.stock > 0);
    });

    const sinStock = productosConOferta.filter(p => {
      const ofertas = p.presentaciones.filter(pres => pres.precio_descuento && pres.precio_descuento > 0);
      return ofertas.every(pres => pres.stock !== null && pres.stock <= 0);
    });

    return [...conStock, ...sinStock];
  });

  getPresentacionesDisponibles(producto: Producto): Presentacion[] {
    const permiteVentaSinStock = this.adminStore.catalogo()?.permitir_ventas_sin_stock ?? false;
    if (permiteVentaSinStock) {
      return producto.presentaciones;
    }
    return producto.presentaciones.filter(p => p.stock === null || p.stock > 0);
  }

  getMejorOferta(presentaciones: Presentacion[]): Presentacion | null {
    if (!presentaciones || presentaciones.length === 0) return null;

    const ofertas = presentaciones.filter(p => p.precio_descuento !== null && p.precio_descuento > 0);
    if (ofertas.length === 0) return null;

    return ofertas.reduce((min, p) => 
      Number(p.precio_descuento) < Number(min.precio_descuento) ? p : min
    );
  }

  onImageLoad() {
    this.imageLoaded.set(true);
  }
}