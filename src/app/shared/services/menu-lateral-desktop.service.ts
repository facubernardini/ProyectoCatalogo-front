import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuLateralDesktopService {
  isOpen = signal(true);

  toggle() {
    this.isOpen.update(open => !open);
  }

  close() {
    this.isOpen.set(false);
  }
}