import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from "@shared/components/icon";
import { ProductCardDesktop } from "./product-card-desktop/product-card-desktop";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

type OrdenCriterio = 'menor-precio' | 'mayor-precio' | 'alfa' | 'default';

@Component({
  selector: 'app-lista-productos-desktop',
  imports: [CommonModule, Icon, ProductCardDesktop],
  templateUrl: './lista-productos-desktop.html',
  styleUrl: './lista-productos-desktop.css',
})
export class ListaProductosDesktop {
  public adminStore = inject(AdminStoreService);
  
  productosRaw = this.adminStore.productos;
  categorias = this.adminStore.categorias;
  
  categoriaSeleccionada = signal<string>('todos');
  ordenSeleccionado = signal<OrdenCriterio>('default');

  paginaActual = signal(1);
  itemsPorPagina = 12;

  productos = computed(() => {
    const cat = this.categoriaSeleccionada();
    let listaFiltrada = (cat === 'todos') 
    ? this.productosRaw() 
    : this.productosRaw().filter(p => 
        p.categorias.some(c => c.nombre === cat)
      );

    const criterio = this.ordenSeleccionado();
    if (criterio === 'default') return listaFiltrada;

    return [...listaFiltrada].sort((a, b) => {
      const precioA = a.presentaciones[0]?.precio ?? 0;
      const precioB = b.presentaciones[0]?.precio ?? 0;

      switch (criterio) {
        case 'menor-precio': return Number(precioA) - Number(precioB);
        case 'mayor-precio': return Number(precioB) - Number(precioA);
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

  categoriasOrdenadas = computed(() => {
    const lista = this.categorias();
    return [...lista].sort((a, b) => {
      if (a.especial && !b.especial) return -1;
      if (!a.especial && b.especial) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  });

  @HostListener('window:scroll')
  onScroll() {
    // Calculamos si el usuario llegó casi al final de la página
    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 300;

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

  seleccionarCategoria(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
    this.paginaActual.set(1);
  }

  aplicarOrden(event: Event) {
    // El evento viene del <select> nativo en Desktop
    const target = event.target as HTMLSelectElement;
    this.ordenSeleccionado.set(target.value as OrdenCriterio);
    this.paginaActual.set(1);
  }
}