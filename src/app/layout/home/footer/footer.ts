import { Component } from '@angular/core';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-footer-landing',
  imports: [Icon],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  public BRAND_DATA = BRAND_DATA;
  public currentYear = new Date().getFullYear();
}
