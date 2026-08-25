import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-hero',
  imports: [Icon], 
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private router = inject(Router);

  mouseX = 0;
  mouseY = 0;
  
  subtitulo1 = 'Tus clientes hacen el pedido por la tienda y llega directo a tu <strong>Whatsapp</strong>.';

  subtitulo2 = '¿Tenés tus productos en un Excel? ¡Te los cargamos nosotros <strong>sin costo</strong>!';

  irARegistro() {
    this.router.navigate(['/register']);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (window.innerWidth >= 768) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      this.mouseX = (event.clientX - centerX) * 0.02;
      this.mouseY = (event.clientY - centerY) * 0.02;
    }
  }
}