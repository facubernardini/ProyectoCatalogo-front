import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { SearchService } from '@shared/services/search.service';
import { ProductCard } from "src/app/layout/catalogo/lista-productos/product-card/product-card";
import { Router } from '@angular/router';
import { ProductCardIndumentaria } from 'src/app/layout/catalogo/indumentaria/product-card-indumentaria/product-card-indumentaria';

@Component({
  selector: 'app-search-products',
  imports: [Icon, ProductCard, ProductCardIndumentaria],
  templateUrl: './search-products.html',
  styleUrl: './search-products.css',
})
export class SearchProducts {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;
  
  public adminStore = inject(AdminStoreService);
  public searchService = inject(SearchService);
  private router = inject(Router);
  
  productos = this.adminStore.productos;

  paginaActual = signal<number>(1);
  itemsPorPagina = 10;

  constructor() {
    effect(() => {
      const isAbierto = this.searchService.isOpen();
      
      if (isAbierto) {
        setTimeout(() => {
          const inputEl = this.searchInput?.nativeElement;
          if (inputEl) {
            inputEl.focus();
            
            const length = inputEl.value.length;
            inputEl.setSelectionRange(length, length);
          }
        }, 10); 
      }
    });
  }

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

  resultadosVisibles = computed(() => {
    const todos = this.resultados();
    const limite = this.paginaActual() * this.itemsPorPagina;
    return todos.slice(0, limite);
  });

  yaCargaronTodos = computed(() => {
    const totalProductos = this.resultados().length;
    const productosMostrados = this.resultadosVisibles().length;
    
    if (totalProductos === 0) return false;
    return productosMostrados >= totalProductos;
  });

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    
    const scrollPosition = target.offsetHeight + target.scrollTop;
    const scrollThreshold = target.scrollHeight - 200;

    if (scrollPosition >= scrollThreshold) {
      this.cargarMas();
    }
  }

  cargarMas() {
    const totalMostrados = this.paginaActual() * this.itemsPorPagina;
    const totalDisponibles = this.resultados().length;

    if (totalMostrados < totalDisponibles) {
      this.paginaActual.update(p => p + 1);
    }
  }

  scrollToTop() {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollTo({ 
        top: 0, 
        behavior: 'smooth'
      });
    }
  }

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchService.query.set(val);
    this.paginaActual.set(1);
    this.scrollToTop();
  }

  limpiarBusqueda() {
    this.searchService.query.set('');
    this.paginaActual.set(1);
    this.scrollToTop();
  }

  irAGrilla() {
    const query = this.searchService.query().trim();
    
    if (query.length > 0) {
      this.searchService.close();
      
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

}