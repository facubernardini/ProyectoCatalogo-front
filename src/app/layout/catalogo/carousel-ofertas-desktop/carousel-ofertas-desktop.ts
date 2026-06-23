import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CartService } from '@shared/services/cart.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ProductosOfertasService } from '@shared/services/productos-ofertas.service';

@Component({
  selector: 'app-carousel-ofertas-desktop',
  imports: [CommonModule, Icon],
  templateUrl: './carousel-ofertas-desktop.html',
  styleUrl: './carousel-ofertas-desktop.css',
})
export class CarouselOfertasDesktop {
  public adminStore = inject(AdminStoreService);
  public productosOfertasService = inject(ProductosOfertasService);
  public productSelectorService = inject(ProductSelectorService);
  private cartService = inject(CartService);

  productosOferta = computed(() => 
    this.adminStore.productos().filter(p => 
      p.presentaciones.some(pres => pres.precio_descuento && pres.precio_descuento > 0)
    )
  );

  // Dividimos el arreglo agrupándolo de a 3 productos por página
  paginas = computed(() => {
    const productos = this.productosOferta();
    const agrupados = [];
    for (let i = 0; i < productos.length; i += 3) {
      agrupados.push(productos.slice(i, i + 3));
    }
    return agrupados;
  });

  currentPage = signal(0);

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

  manejarClickOferta(producto: Producto, event: Event) {
    // Evitamos que el clic en el botón del carrito abra también el modal del producto
    event.stopPropagation(); 
    
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