import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from '@shared/components/icon';

@Component({
  selector: 'app-carrousel-destacados',
  imports: [CommonModule],
  templateUrl: './carrousel-destacados.html',
  styleUrl: './carrousel-destacados.css',
})
export class CarrouselDestacados implements AfterViewInit, OnDestroy{
  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;

  featuredProducts = [];
  
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
