import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlanesDialogService {
  public isOpen = signal(false);
  public isFromPanel = signal(false);

  open(fromPanel: boolean = false) {
    this.isFromPanel.set(fromPanel);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    document.body.style.overflow = 'auto';
    
    setTimeout(() => this.isFromPanel.set(false), 300);
  }
}