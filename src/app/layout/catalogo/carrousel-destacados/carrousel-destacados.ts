import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from '@shared/components/icon';
import { ProductoDestacado } from "./producto-destacado/producto-destacado";

@Component({
  selector: 'app-carrousel-destacados',
  imports: [CommonModule, Icon, ProductoDestacado],
  templateUrl: './carrousel-destacados.html',
  styleUrl: './carrousel-destacados.css',
})
export class CarrouselDestacados implements AfterViewInit, OnDestroy{
  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;

  originalProducts = [
    { id: 1, name: 'Cafetera Espresso Premium', price: 299.99, image: 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?q=80&w=500', featured: true },
    { id: 2, name: 'Molino de Café Cerámico', price: 45.50, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=500', featured: true },
    { id: 3, name: 'Set de Tazas Artesanales', price: 32.00, image: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?q=80&w=500', featured: true },
    { id: 4, name: 'Café de Origen - Etiopía', price: 18.00, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=500', featured: true }
  ];

  featuredProducts = [...this.originalProducts, ...this.originalProducts, ...this.originalProducts];
  
  private intervalId: any;

  ngAfterViewInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  scroll(direction: number) {
    const container = this.carousel.nativeElement;
    const scrollAmount = container.offsetWidth;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });

    if (container.scrollLeft <= 0 && direction === -1) {
      container.scrollLeft = container.scrollWidth / 3;
    } else if (container.scrollLeft + container.offsetWidth >= container.scrollWidth && direction === 1) {
      container.scrollLeft = container.scrollWidth / 3;
    }
  }

  startAutoPlay() {
    this.intervalId = setInterval(() => {
      this.scroll(1);
    }, 5000);
  }

  stopAutoPlay() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
