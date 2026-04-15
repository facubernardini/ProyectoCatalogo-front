import { Component, computed, inject } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductSelectorService } from 'src/app/core/services/product-selector.service';
import { SearchService } from 'src/app/core/services/search.service';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-search-products',
  imports: [Icon],
  templateUrl: './search-products.html',
  styleUrl: './search-products.css',
})
export class SearchProducts {
  public adminStore = inject(AdminStoreService);
  public searchService = inject(SearchService);
  private selectorService = inject(ProductSelectorService);
  
  productos = this.adminStore.productos;

  resultados = computed(() => {
    const q = this.searchService.debouncedQuery().toLowerCase().trim();
    
    if (q.length < 2) return [];

    return this.productos().filter(p => 
      p.nombre.toLowerCase().includes(q) || 
      p.descripcion?.toLowerCase().includes(q)
    );
  });

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchService.query.set(val);
  }

  abrirProducto(producto: Producto) {
    this.searchService.close();
    this.selectorService.open(producto);
  }

  getPrecioDesde(presentaciones: Presentacion[]): number {
    if (!presentaciones.length) return 0;
    
    const preciosActuales = presentaciones.map(p => 
      p.precio_descuento !== null ? Number(p.precio_descuento) : Number(p.precio)
    );
    
    return Math.min(...preciosActuales);
  }

  tieneOfertas(presentaciones: Presentacion[]): boolean {
    return presentaciones.some(p => p.precio_descuento !== null);
  }
}
