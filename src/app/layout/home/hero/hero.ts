import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-hero',
  imports: [Icon], 
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnInit, OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  tituloPrincipal = 'Gestiona tu negocio de forma';
  tituloResaltado = 'inteligente';
  
  subtitulo = 'La plataforma minimalista que te ayuda a listar, organizar y escalar sin complicaciones ni curvas de aprendizaje.';

  rotacionActual = 0;
  intervalo: any;

  ngOnInit() {
    this.intervalo = setInterval(() => {
      this.rotacionActual -= 120;
      this.cdr.detectChanges();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }
}