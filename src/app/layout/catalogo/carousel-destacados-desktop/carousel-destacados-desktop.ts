import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ExploradorProductosService } from 'src/app/shared/services/explorador-productos.service';
import { SafeHtmlPipe } from "../../../core/pipes/safe-html.pipe";

@Component({
  selector: 'app-carousel-destacados-desktop',
  imports: [CommonModule, Icon, SafeHtmlPipe],
  templateUrl: './carousel-destacados-desktop.html',
  styleUrl: './carousel-destacados-desktop.css',
})
export class CarouselDestacadosDesktop {
  public adminStore = inject(AdminStoreService);
  public productSelectorService = inject(ProductSelectorService);
  public exploradorService = inject(ExploradorProductosService);

  public imageLoaded = signal(false);

  itemsPorPagina = signal(window.innerWidth >= 1280 ? 3 : 2);

  productosDestacados = computed(() => 
    this.adminStore.productos().filter(p => p.destacado)
  );

  paginas = computed(() => {
    const productos = this.productosDestacados();
    const cantidad = this.itemsPorPagina();
    const agrupados = [];
    
    for (let i = 0; i < productos.length; i += cantidad) {
      agrupados.push(productos.slice(i, i + cantidad));
    }
    
    return agrupados;
  });

  currentPage = signal(0);

  @HostListener('window:resize')
  onResize() {
    this.itemsPorPagina.set(window.innerWidth >= 1280 ? 3 : 2);
  }

  verTodosLosDestacados() {
    this.exploradorService.verDestacados();
  }

  next() {
    if (this.currentPage() < this.paginas().length - 1) {
      this.currentPage.update(p => p + 1);
    } else {
      this.currentPage.set(0);
    }
  }

  prev() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
    } else {
      this.currentPage.set(this.paginas().length - 1);
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

  onImageLoad() {
    this.imageLoaded.set(true);
  }
}