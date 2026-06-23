import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Icon } from "@shared/components/icon";

import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { InfoService } from '@shared/services/info.service';
import { SearchService } from '@shared/services/search.service';
import { CartService } from '@shared/services/cart.service';
import { BannerInfoDesktop } from "../banner-info-desktop/banner-info-desktop";

@Component({
  selector: 'app-navbar-desktop',
  imports: [Icon, BannerInfoDesktop],
  templateUrl: './navbar-desktop.html',
  styleUrl: './navbar-desktop.css',
})
export class NavbarDesktop implements AfterViewInit {
  @ViewChild('sentinel') sentinel!: ElementRef;

  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
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