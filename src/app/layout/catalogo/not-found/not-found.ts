import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '@shared/components/icon';

@Component({
  selector: 'app-not-found',
  imports: [Icon],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  private router = inject(Router);

  volverAlInicio() {
    this.router.navigate(['/']); 
  }
}
