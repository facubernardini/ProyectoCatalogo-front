import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-error',
  imports: [Icon],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class ErrorView {
  private router = inject(Router);

  volverAlInicio() {
    this.router.navigate(['/']); 
  }
}
