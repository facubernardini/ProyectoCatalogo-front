import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { ProductCard } from "./product-card/product-card";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CommonModule } from '@angular/common';

type OrdenCriterio = 'menor-precio' | 'mayor-precio' | 'alfa' | 'default';

@Component({
  selector: 'app-lista-productos',
  imports: [Icon, SwipeDownDirective, ProductCard, CommonModule],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css',
})
export class ListaProductos {
  public adminStore = inject(AdminStoreService);
  
  productosRaw = this.adminStore.productos;
  categorias = this.adminStore.categorias;
  
  categoriaManual = signal<string | null>(null);
  
  ordenSeleccionado = signal<OrdenCriterio>('default');
  mostrarModalFiltros = signal(false);

  paginaActual = signal(1);
  itemsPorPagina = 10;

  categoriasOrdenadas = computed(() => {
    const lista = this.categorias();
    
    return [...lista].sort((a, b) => {
      if (a.especial && !b.especial) return -1;
      if (!a.especial && b.especial) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  });

  categoriaSeleccionada = computed(() => {
    const seleccion = this.categoriaManual();
    if (seleccion) return seleccion;

    const listaOrdenadas = this.categoriasOrdenadas();
    return listaOrdenadas.length > 0 ? listaOrdenadas[0].nombre : '';
  });

  productos = computed(() => {
    const cat = this.categoriaSeleccionada();
    
    if (!cat) return []; 

    let listaFiltrada = this.productosRaw().filter(p => 
        p.categorias.some(c => c.nombre === cat)
    );

    const criterio = this.ordenSeleccionado();
    if (criterio === 'default') return listaFiltrada;

    return [...listaFiltrada].sort((a, b) => {
      const precioA = a.presentaciones[0]?.precio ?? 0;
      const precioB = b.presentaciones[0]?.precio ?? 0;

      switch (criterio) {
        case 'menor-precio': return precioA - precioB;
        case 'mayor-precio': return precioB - precioA;
        case 'alfa': return a.nombre.localeCompare(b.nombre);
        default: return 0;
      }
    });
  });

  productosVisibles = computed(() => {
    const todosLosProductos = this.productos();
    const limite = this.paginaActual() * this.itemsPorPagina;
    
    return todosLosProductos.slice(0, limite);
  });

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 200;

    if (scrollPosition >= scrollThreshold) {
      this.cargarMas();
    }
  }

  cargarMas() {
    const totalMostrados = this.paginaActual() * this.itemsPorPagina;
    const totalDisponibles = this.productos().length;

    if (totalMostrados < totalDisponibles) {
      this.paginaActual.update(p => p + 1);
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    if (this.mostrarModalFiltros() && history.state?.modal !== 'filtros-modal') {
      this.cerrarFiltrosInterno();
    }
  }

  seleccionarCategoria(nombre: string) {
    this.categoriaManual.set(nombre);
    this.paginaActual.set(1);
  }

  aplicarOrden(criterio: OrdenCriterio) {
    this.ordenSeleccionado.set(criterio);
    this.paginaActual.set(1);
    this.cerrarFiltros();
  }

  abrirFiltros() {
    if (this.mostrarModalFiltros()) return;

    this.mostrarModalFiltros.set(true);
    document.body.style.overflow = 'hidden';
    history.pushState({ modal: 'filtros-modal' }, '');
  }

  cerrarFiltros() {
    this.cerrarFiltrosInterno();

    if (history.state?.modal === 'filtros-modal') {
      history.back();
    }
  }

  private cerrarFiltrosInterno() {
    if (!this.mostrarModalFiltros()) return;

    this.mostrarModalFiltros.set(false);
    document.body.style.overflow = 'auto';
  }
}