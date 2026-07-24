import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [], 
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private router = inject(Router);
  
  tituloPrincipal = 'Creá tu tienda online en minutos';
  
  subtitulo = '¡Tener una tienda online nunca fue tan fácil! Adaptada a celulares donde están el 95% de tus clientes.';

  irARegistro() {
    this.router.navigate(['/register']);
  }
}