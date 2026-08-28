import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-features',
  imports: [Icon],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features implements AfterViewInit, OnDestroy {
  cuponesAnimados = false;
  private cuponObserver: IntersectionObserver | null = null;
  
  @ViewChild('cuponesContainer') cuponesContainer!: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}

  catalogoImages = [
    { src: 'assets/home/catalogo-publico/tienda.webp', alt: 'Vista de la tienda' },
    { src: 'assets/home/catalogo-publico/info.webp', alt: 'Información de la tienda' },
    { src: 'assets/home/catalogo-publico/menu_lateral.webp', alt: 'Menú lateral de categorías' },
    { src: 'assets/home/catalogo-publico/mapa.webp', alt: 'Vista del mapa' }
  ];

  panelImages = [
    { src: 'assets/home/panel-vendedor/pv_inicio.webp', alt: 'Panel de inicio' },
    { src: 'assets/home/panel-vendedor/pv_productos.webp', alt: 'Gestión de productos' },
    { src: 'assets/home/panel-vendedor/pv_pedidos.webp', alt: 'Gestión de pedidos' },
    { src: 'assets/home/panel-vendedor/pv_estadisticas.webp', alt: 'Estadísticas' }
  ];

  currentCatalogoIndex = 0;
  currentPanelIndex = 0;

  ngAfterViewInit() {
    this.cuponObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && window.innerWidth < 768) {
        this.cuponesAnimados = true;
        this.cdr.detectChanges();
        this.cuponObserver?.disconnect();
      }
    }, { 
      threshold: 1.0 
    });

    if (this.cuponesContainer) {
      this.cuponObserver.observe(this.cuponesContainer.nativeElement);
    }
  }

  ngOnDestroy() {
    this.cuponObserver?.disconnect();
  }

  // Funciones del Carrusel Panel Vendedor
  onPanelScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.currentPanelIndex = Math.round(target.scrollLeft / (target.clientWidth + 24));
  }

  scrollPanel(container: HTMLElement, direction: number) {
    const scrollAmount = container.clientWidth + 24;
    container.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }

  scrollToPanel(index: number, container: HTMLElement) {
    const scrollAmount = container.clientWidth + 24;
    container.scrollTo({ left: scrollAmount * index, behavior: 'smooth' });
  }

  // Funciones del Carrusel Catalogo
  onCatalogoScroll(event: Event) {
    const element = event.target as HTMLElement;
    this.currentCatalogoIndex = Math.round(element.scrollLeft / element.clientWidth);
  }

  scrollCatalogo(container: HTMLElement, direction: number) {
    const scrollAmount = container.clientWidth;
    container.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }

  scrollToCatalogo(index: number, container: HTMLElement) {
    const scrollPosition = container.clientWidth * index;
    container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
  }
}