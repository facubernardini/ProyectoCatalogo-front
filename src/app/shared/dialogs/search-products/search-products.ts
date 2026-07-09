import { Component, computed, inject } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { SearchService } from '@shared/services/search.service';
import { ProductCard } from "src/app/layout/catalogo/lista-productos/product-card/product-card";

@Component({
  selector: 'app-search-products',
  imports: [Icon, ProductCard],
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

  abrirProducto(producto: Producto, fromModal: boolean = false) {
    this.selectorService.open(producto, fromModal);
  }

}
