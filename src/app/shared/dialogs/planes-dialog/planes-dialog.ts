import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { PRICES } from 'src/app/core/data/prices.data';
import { Icon } from "src/app/shared/components/icon";
import { PlanesDialogService } from '../../services/planes-dialog.service';

@Component({
  selector: 'app-planes-dialog',
  standalone: true,
  imports: [CommonModule, RouterLink, Icon],
  templateUrl: './planes-dialog.html'
})
export class PlanesDialog {
  public planesDialogService = inject(PlanesDialogService);

  public planes = PRICES;
  public BRAND_DATA = BRAND_DATA;

  public isAnual = signal(false);

  public cardTransforms: Record<string, string> = {};

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

  contactar() {
    const numeroLimpio = this.BRAND_DATA.contact.whatsapp.replace(/\D/g, '');
    const msg = 'Hola, me gustaría contratar el plan Ultra para mi tienda!';
    
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(msg)}`;
    
    this.planesDialogService.close();
    window.open(url, '_blank');
  }
}