import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ProductosDestacadosService } from '@shared/services/productos-destacados.service';

@Component({
  selector: 'app-carousel-destacados-desktop',
  imports: [CommonModule, Icon],
  templateUrl: './carousel-destacados-desktop.html',
  styleUrl: './carousel-destacados-desktop.css',
})
export class CarouselDestacadosDesktop {
  public adminStore = inject(AdminStoreService);
  public productosDestacadosService = inject(ProductosDestacadosService);
  public productSelectorService = inject(ProductSelectorService);

  // 1. Obtenemos los destacados
  productosDestacados = computed(() => 
    this.adminStore.productos().filter(p => p.destacado)
  );

  // 2. MAGIA DESKTOP: Dividimos el array de a 2 productos por "página"
  paginas = computed(() => {
    const productos = this.productosDestacados();
    const agrupados = [];
    for (let i = 0; i < productos.length; i += 2) {
      agrupados.push(productos.slice(i, i + 2));
    }
    return agrupados;
  });

  // 3. Estado de la página actual para los puntitos y flechas
  currentPage = signal(0);

  next() {
    if (this.currentPage() < this.paginas().length - 1) {
      this.currentPage.update(p => p + 1);
    } else {
      this.currentPage.set(0); // Vuelve al principio si llegó al final
    }
  }

  prev() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
    } else {
      this.currentPage.set(this.paginas().length - 1); // Va al final si estaba en el principio
    }
  }

  goTo(index: number) {
    this.currentPage.set(index);
  }

  getMejorOferta(presentaciones: Presentacion[]): Presentacion | null {
    if (!presentaciones?.length) return null;
    return presentaciones.reduce((prev, curr) => {
      const precioPrev = prev.precio_descuento ?? prev.precio;
      const precioCurr = curr.precio_descuento ?? curr.precio;
      return Number(precioCurr) < Number(precioPrev) ? curr : prev;
    });
  }
}