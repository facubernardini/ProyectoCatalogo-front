import { Component, signal } from '@angular/core';
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
}
