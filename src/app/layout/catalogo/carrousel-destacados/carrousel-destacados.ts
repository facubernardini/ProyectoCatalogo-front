import { AfterViewInit, Component, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-carrousel-destacados',
  imports: [CommonModule, Icon],
  templateUrl: './carrousel-destacados.html',
  styleUrl: './carrousel-destacados.css',
})
export class CarrouselDestacados {
  productosDestacados = input.required<Producto[]>();
  
  container = viewChild<ElementRef>('container');
  
  private intervalId: any;

  scroll(direccion: 'izq' | 'der') {
    // Usamos el signo ? para que si es undefined, no explote la app
    const element = this.container()?.nativeElement;

    if (element) {
      const scrollAmount = 300;
      element.scrollBy({
        left: direccion === 'der' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    } else {
      console.warn("Todavía no se puede scrollear: el elemento no existe en el DOM");
    }
  }

}
