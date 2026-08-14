import { Component, computed, inject, input, signal } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { SafeHtmlPipe } from "../../../../core/pipes/safe-html.pipe";
import { CommonModule } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-product-card-desktop',
  imports: [CommonModule, Icon, SafeHtmlPipe],
  templateUrl: './product-card-desktop.html',
  styleUrl: './product-card-desktop.css',
})
export class ProductCardDesktop {
  public adminStore = inject(AdminStoreService);
  public productSelectorService = inject(ProductSelectorService);
  
  producto = input.required<Producto>();

  public imageLoaded = signal(false);

  presentacionesDisponibles = computed(() => {
    const prod = this.producto();
    const permiteVentaSinStock = this.adminStore.catalogo()?.permitir_ventas_sin_stock ?? false;
    
    if (permiteVentaSinStock) {
      return prod.presentaciones;
    }

    return prod.presentaciones.filter(p => p.stock === null || p.stock > 0);
  });

  estaAgotado = computed(() => this.presentacionesDisponibles().length === 0);

  mejorOferta = computed(() => this.getMejorOferta(this.presentacionesDisponibles()));

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