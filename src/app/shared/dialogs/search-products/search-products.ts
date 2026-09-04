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
    const queryOriginal = this.searchService.debouncedQuery().trim();
    if (queryOriginal.length < 2) return [];

    // 1. Limpieza general y Tokenización
    const queryLimpia = queryOriginal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const terminosBusqueda = queryLimpia.split(' ').filter(t => t.length > 0);
    
    const queryCompacta = queryLimpia.replace(/\s+/g, "");

    if (terminosBusqueda.length === 0) return [];
    const primerTermino = terminosBusqueda[0];

    // 2. Filtrado base dual
    const filtrados = this.productos().filter(p => {
      const camposUnidos = [p.nombre, p.descripcion, p.marca].filter(Boolean).join(' ');
      const textoProducto = camposUnidos.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Texto del producto totalmente unido
      const textoProductoCompacto = textoProducto.replace(/\s+/g, "");

      // Match A: Todas las palabras separadas existen (ideal para "pasta mani" -> "pasta de mani")
      const matchClasico = terminosBusqueda.every(termino => textoProducto.includes(termino));
      
      // Match B: La cadena de caracteres continua existe (ideal para "entrenuts" -> "entre nuts")
      const matchCompacto = textoProductoCompacto.includes(queryCompacta);

      return matchClasico || matchCompacto;
    });

    // 3. Sistema de Puntaje (Scoring)
    return filtrados.map(p => {
      const nombre = (p.nombre || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const marca = (p.marca || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const desc = (p.descripcion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Versiones compactas para el scoring
      const nombreCompacto = nombre.replace(/\s+/g, "");
      const marcaCompacta = marca.replace(/\s+/g, "");

      let score = 0;

      if (nombre === queryLimpia) {
        score = 100;
      } 
      else if (nombre.startsWith(queryLimpia)) {
        score = 90;
      }
      else if (nombre.includes(queryLimpia)) {
        score = 80;
      }
      else if (nombre.startsWith(primerTermino) && terminosBusqueda.every(t => nombre.includes(t))) {
        score = 70;
      }
      else if (terminosBusqueda.every(t => nombre.includes(t))) {
        score = 60;
      } 
      else if (nombreCompacto.includes(queryCompacta)) {
        score = 55;
      }
      else if (marcaCompacta.includes(queryCompacta)) {
        score = 50; 
      }
      else if (terminosBusqueda.some(t => marca.includes(t))) {
        score = 40;
      } 
      else if (terminosBusqueda.some(t => desc.includes(t))) {
        score = 20;
      } 
      else {
        score = 10;
      }

      return { producto: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.producto);
  });

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchService.query.set(val);
  }

  abrirProducto(producto: Producto, fromModal: boolean = false) {
    this.selectorService.open(producto, fromModal);
  }

}
