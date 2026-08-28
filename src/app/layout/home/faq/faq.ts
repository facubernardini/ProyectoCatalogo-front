import { Component, signal } from '@angular/core';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { FAQ_DATA } from 'src/app/core/data/faq.data';

@Component({
  selector: 'app-faq',
  imports: [],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {
  public faqs = FAQ_DATA;
  
  public openIndex = signal<number | null>(null);

  toggle(index: number) {
    this.openIndex.update(current => current === index ? null : index);
  }

  contactarSoporte() {
    const numeroLimpio = BRAND_DATA.contact.whatsapp.replace(/\D/g, '');
    
    const url = `https://wa.me/${numeroLimpio}`;
    
    window.open(url, '_blank');
  }
}
