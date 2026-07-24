import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-en-construccion',
  imports: [Icon],
  templateUrl: './en-construccion.html',
  styleUrl: './en-construccion.css',
})
export class EnConstruccion {
  private router = inject(Router);

  irALogin() {
    this.router.navigate(['/login']);
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }
}
