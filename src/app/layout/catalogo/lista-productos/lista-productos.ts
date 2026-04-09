import { Component, computed, input, signal } from '@angular/core';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { Icon } from "@shared/components/icon";
import { Producto } from 'src/app/core/models/producto.model';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { ProductCard } from "./product-card/product-card";

type OrdenCriterio = 'menor-precio' | 'mayor-precio' | 'alfa' | 'default';

@Component({
  selector: 'app-lista-productos',
  imports: [Icon, SwipeDownDirective, ProductCard],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css',
})
export class ListaProductos {
  productosRaw = input.required<Producto[]>();
  categorias = input.required<CategoriaVendedor[]>();
  
  categoriaSeleccionada = signal<string>('todos');
  ordenSeleccionado = signal<OrdenCriterio>('default');
  mostrarModalFiltros = signal(false);

  productos = computed(() => {
    const cat = this.categoriaSeleccionada();
    let listaFiltrada = (cat === 'todos') 
      ? this.productosRaw() 
      : this.productosRaw().filter(p => p.categorias.includes(cat));

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