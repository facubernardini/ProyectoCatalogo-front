import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { Producto } from 'src/app/core/models/producto.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ProductosDestacadosService } from '@shared/services/productos-destacados.service';
import { SafeHtmlPipe } from "../../../core/pipes/safe-html.pipe";

@Component({
  selector: 'app-carousel-destacados',
  imports: [CommonModule, Icon, SafeHtmlPipe],
  templateUrl: './carousel-destacados.html',
  styleUrl: './carousel-destacados.css',
})
export class CarouselDestacados {
  public adminStore = inject(AdminStoreService);
  public productosDestacadosService = inject(ProductosDestacadosService);
  public productSelectorService = inject(ProductSelectorService);

  public imageLoaded = signal(false);

  productosDestacados = computed(() => 
    this.adminStore.productos().filter(p => p.destacado)
  );

  getPresentacionesDisponibles(producto: Producto): Presentacion[] {
    const permiteVentaSinStock = this.adminStore.catalogo()?.permitir_ventas_sin_stock ?? false;
    
    if (permiteVentaSinStock) {
      return producto.presentaciones;
    }

    return producto.presentaciones.filter(p => p.stock === null || p.stock > 0);
  }

  estaAgotado(producto: Producto): boolean {
    return this.getPresentacionesDisponibles(producto).length === 0;
  }

  getMejorOferta(presentaciones: Presentacion[]): Presentacion | null {
    if (!presentaciones?.length) return null;

    return presentaciones.reduce((prev, curr) => {
      const precioPrev = prev.precio_descuento ?? prev.precio;
      const precioCurr = curr.precio_descuento ?? curr.precio;
      
      return Number(precioCurr) < Number(precioPrev) ? curr : prev;
    });
  }

  onImageLoad() {
    this.imageLoaded.set(true);
  }
}