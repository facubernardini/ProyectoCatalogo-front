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

  panelImages = [
    { src: 'assets/home/pv_inicio.webp', alt: 'Panel de inicio' },
    { src: 'assets/home/pv_productos.webp', alt: 'Gestión de productos' },
    { src: 'assets/home/pv_pedidos.webp', alt: 'Gestión de pedidos' },
    { src: 'assets/home/pv_estadisticas.webp', alt: 'Estadísticas' }
  ];

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
}