import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PRICES } from 'src/app/core/data/prices.data';

@Component({
  selector: 'app-pricing',
  imports: [CommonModule],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class Pricing {
  planes = PRICES;

  isAnual = false;
  activeIndex = 0;

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.activeIndex = Math.round(target.scrollLeft / target.clientWidth);
  }

  scrollTo(index: number, container: HTMLElement) {
    container.scrollTo({
      left: index * container.clientWidth,
      behavior: 'smooth'
    });
  }
}
