import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from "./navbar/navbar";
import { CarrouselDestacados } from "./carrousel-destacados/carrousel-destacados";

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, Navbar, CarrouselDestacados],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoPublico {

}
