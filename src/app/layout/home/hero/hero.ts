import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [], 
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private router = inject(Router);
  
  subtitulo1 = 'Tus clientes hacen el pedido por la tienda y llega directo a tu <strong>Whatsapp</strong>.';

  subtitulo2 = '¿Tenés tus productos en un Excel? ¡Te los cargamos nosotros <strong>sin costo</strong>!';

  irARegistro() {
    this.router.navigate(['/register']);
  }
}