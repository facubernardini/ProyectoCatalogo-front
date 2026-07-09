import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ExploradorProductosService } from 'src/app/shared/services/explorador-productos.service';
import { SafeHtmlPipe } from "../../../core/pipes/safe-html.pipe";

@Component({
  selector: 'app-carousel-ofertas-desktop',
  imports: [CommonModule, Icon, SafeHtmlPipe],
  templateUrl: './carousel-ofertas-desktop.html',
  styleUrl: './carousel-ofertas-desktop.css',
})
export class CarouselOfertasDesktop {
  public adminStore = inject(AdminStoreService);
  public productSelectorService = inject(ProductSelectorService);
  public exploradorProductosService = inject(ExploradorProductosService);

  itemsPorPagina = signal(window.innerWidth >= 1280 ? 3 : 2);

  productosOferta = computed(() => 
    this.adminStore.productos().filter(p => 
      p.presentaciones.some(pres => pres.precio_descuento && pres.precio_descuento > 0)
    )
  );

  paginas = computed(() => {
    const productos = this.productosOferta();
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

  verOfertasEnExplorador() {
    this.exploradorProductosService.verTodasLasOfertas();
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
    if (!presentaciones || presentaciones.length === 0) return null;

    const ofertas = presentaciones.filter(p => p.precio_descuento !== null);
    if (ofertas.length === 0) return null;

    return ofertas.reduce((min, p) => 
      Number(p.precio_descuento) < Number(min.precio_descuento) ? p : min
    );
  }
}