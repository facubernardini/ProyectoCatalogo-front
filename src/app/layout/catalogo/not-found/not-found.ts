import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  volverAlInicio() {
    window.location.href = 'https://listalo.com.ar';
  }
}
