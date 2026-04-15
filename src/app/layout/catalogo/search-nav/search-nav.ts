import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CartService } from 'src/app/core/services/cart.service';
import { SearchService } from 'src/app/core/services/search.service';

@Component({
  selector: 'app-search-nav',
  imports: [Icon],
  templateUrl: './search-nav.html',
  styleUrl: './search-nav.css',
})
export class SearchNav implements AfterViewInit{
  @ViewChild('sentinel') sentinel!: ElementRef;

  public searchService = inject(SearchService);
  public cartService = inject(CartService);

  isStuck = signal(false);

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        this.isStuck.set(!entry.isIntersecting);
      },
      {
        threshold: [0],
        rootMargin: '0px'
      }
    );

    observer.observe(this.sentinel.nativeElement);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    
    this.searchService.query.set(value);

    if (value.trim().length > 0) {
      this.searchService.open();
    }
  }

  clearSearch() {
    this.searchService.query.set('');
  }
}
