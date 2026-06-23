import { Component } from '@angular/core';
import { BRAND_DATA } from 'src/app/core/data/brand.data';

@Component({
  selector: 'app-footer-desktop',
  imports: [],
  templateUrl: './footer-desktop.html',
  styleUrl: './footer-desktop.css',
})
export class FooterDesktop {
  public BRAND_DATA = BRAND_DATA;
  
  currentYear = new Date().getFullYear();

  irAHome() {
    window.open('/', '_blank');
  }

  irACreacion() {
    window.open('/register', '_blank');
  }
}
