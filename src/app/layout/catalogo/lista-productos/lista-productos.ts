import { Component, computed, inject, input, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { ProductCard } from "./product-card/product-card";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

type OrdenCriterio = 'menor-precio' | 'mayor-precio' | 'alfa' | 'default';

@Component({
  selector: 'app-lista-productos',
  imports: [Icon, SwipeDownDirective, ProductCard],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css',
})
export class ListaProductos {
  public adminStore = inject(AdminStoreService);
  
  productosRaw = this.adminStore.productos;
  categorias = this.adminStore.categorias;
  
  categoriaSeleccionada = signal<string>('todos');
  ordenSeleccionado = signal<OrdenCriterio>('default');
  mostrarModalFiltros = signal(false);

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
        case 'menor-precio': return precioA - precioB;
        case 'mayor-precio': return precioB - precioA;
        case 'alfa': return a.nombre.localeCompare(b.nombre);
        default: return 0;
      }
    });
  });

  categoriasOrdenadas = computed(() => {
    const lista = this.categorias();
    
    return [...lista].sort((a, b) => {
      if (a.especial && !b.especial) return -1;
      if (!a.especial && b.especial) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  });

  seleccionarCategoria(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
  }

  abrirFiltros() {
    this.mostrarModalFiltros.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarFiltros() {
    this.mostrarModalFiltros.set(false);
    document.body.style.overflow = 'auto';
  }

  aplicarOrden(criterio: OrdenCriterio) {
    this.ordenSeleccionado.set(criterio);
    this.cerrarFiltros();
  }

}