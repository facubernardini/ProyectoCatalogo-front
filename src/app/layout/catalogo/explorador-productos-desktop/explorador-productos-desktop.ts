import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { Icon } from 'src/app/shared/components/icon';
import { ExploradorProductosService } from 'src/app/shared/services/explorador-productos.service';
import { ProductCardDesktop } from '../lista-productos-desktop/product-card-desktop/product-card-desktop';

@Component({
  selector: 'app-explorador-productos-desktop',
  imports: [CommonModule, ProductCardDesktop, Icon],
  templateUrl: './explorador-productos-desktop.html',
  styleUrl: './explorador-productos-desktop.css',
})
export class ExploradorProductosDesktop {
  public explorador = inject(ExploradorProductosService);

  paginaActual = signal<number>(1);
  itemsPorPagina = 16;

  productosVisibles = computed(() => {
    const todosLosFiltrados = this.explorador.productosFiltrados();
    
    const limite = this.paginaActual() * this.itemsPorPagina;
    return todosLosFiltrados.slice(0, limite);
  });

  constructor() {
    effect(() => {
      this.explorador.vistaActual();
      this.explorador.terminoBusqueda();
      this.explorador.categoriaSeleccionada();
      
      this.paginaActual.set(1);
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 300;

    if (scrollPosition >= scrollThreshold) {
      this.cargarMas();
    }
  }

  cargarMas() {
    const totalMostrados = this.paginaActual() * this.itemsPorPagina;
    const totalDisponibles = this.explorador.productosFiltrados().length;

    if (totalMostrados < totalDisponibles) {
      this.paginaActual.update(p => p + 1);
    }
  }
}
