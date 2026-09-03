import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { PRICES } from 'src/app/core/data/prices.data';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-pricing',
  imports: [RouterLink, CommonModule, Icon],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class Pricing {
  private router = inject(Router);

  public BRAND_DATA = BRAND_DATA;
  public planes = PRICES;

  isAnual = false;
  activeIndex = 0;

  cardTransforms: Record<string, string> = {};

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

  onMouseMove(event: MouseEvent, planId: any) {
    if (window.innerWidth < 1024) return;

    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3; 
    const rotateY = ((x - centerX) / centerX) * 3;

    this.cardTransforms[planId] = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  }

  onMouseLeave(planId: any) {
    if (window.innerWidth < 1024) return;
    
    this.cardTransforms[planId] = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }

  contactar() {
    const numeroLimpio = BRAND_DATA.contact.whatsapp.replace(/\D/g, '');
    const msg = 'Hola, me gustaría contratar el plan Ultra para mi tienda!';
    
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(msg)}`;
    
    window.open(url, '_blank');
  }
}
