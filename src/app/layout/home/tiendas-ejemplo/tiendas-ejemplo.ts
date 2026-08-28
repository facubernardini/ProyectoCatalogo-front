import { Component } from '@angular/core';
import { TIENDAS_EJEMPLO } from 'src/app/core/data/tiendas-ejemplo.data';

@Component({
  selector: 'app-tiendas-ejemplo',
  imports: [],
  templateUrl: './tiendas-ejemplo.html',
  styleUrl: './tiendas-ejemplo.css',
})
export class TiendasEjemplo {
  public tiendas = TIENDAS_EJEMPLO;
}