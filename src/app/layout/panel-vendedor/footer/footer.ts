import { Component } from '@angular/core';
import { BRAND_DATA } from 'src/app/core/data/brand.data';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  public fechaActual = new Date().getFullYear();

  public nombrePlataforma = BRAND_DATA.name;
}