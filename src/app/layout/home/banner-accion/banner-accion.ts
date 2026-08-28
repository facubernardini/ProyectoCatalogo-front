import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-banner-accion',
  imports: [Icon],
  templateUrl: './banner-accion.html',
  styleUrl: './banner-accion.css',
})
export class BannerAccion {
  private router = inject(Router);
  
  irARegistro() {
    this.router.navigate(['/register']);
  }
}
