import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuPrincipalService {
  isOpen = signal<boolean>(false);

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }
}