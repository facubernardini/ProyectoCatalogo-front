import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductSelectorService } from 'src/app/core/services/product-selector.service';
import { SearchService } from 'src/app/core/services/search.service';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-search-products',
  imports: [Icon],
  templateUrl: './search-products.html',
  styleUrl: './search-products.css',
})
export class SearchProducts {
  productos = input.required<Producto[]>();

  public searchService = inject(SearchService);
  private selectorService = inject(ProductSelectorService);

  // Filtramos automáticamente cuando cambia la query o los productos
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
    this.searchService.close(); // Cerramos el buscador
    this.selectorService.open(producto); // Abrimos el detalle del producto
  }
}
