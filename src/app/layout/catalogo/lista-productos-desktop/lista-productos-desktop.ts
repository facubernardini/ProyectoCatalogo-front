import { Component, computed, inject, signal, HostListener, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('scrollTrack') scrollTrack!: ElementRef<HTMLDivElement>;

  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  
  productosRaw = this.adminStore.productos;
  categorias = this.adminStore.categorias;
  
  categoriaSeleccionada = signal<string>('todos');
  ordenSeleccionado = signal<OrdenCriterio>('default');
  
  // NUEVO: Controla si el menú desplegable está abierto o cerrado
  isOrdenDropdownOpen = signal(false);

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

  ngAfterViewInit() {
    setTimeout(() => this.checkScroll(), 100);
  }

  checkScroll() {
    if (!this.scrollTrack) return;
    const el = this.scrollTrack.nativeElement;
    
    this.canScrollLeft.set(el.scrollLeft > 0);
    
    // Le restamos 2 píxeles al ancho total para ignorar cualquier decimal rebelde del navegador
    this.canScrollRight.set(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 2);
  }

  scrollCategorias(direccion: 'left' | 'right') {
    if (!this.scrollTrack) return;
    const el = this.scrollTrack.nativeElement;
    
    // Scrollea un 60% del ancho visible para que el usuario no pierda el contexto de dónde está
    const scrollAmount = el.clientWidth * 0.6; 
    
    el.scrollBy({
      left: direccion === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

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

  // MODIFICADO: Ahora recibe el string directo y cierra el menú
  aplicarOrden(criterio: OrdenCriterio) {
    this.ordenSeleccionado.set(criterio);
    this.paginaActual.set(1);
    this.isOrdenDropdownOpen.set(false);
  }
}