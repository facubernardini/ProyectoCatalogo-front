import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InfoService {
  isOpen = signal(false);
  
  private overflowAnterior = ''; 

  open() { 
    if (this.isOpen()) return;

    this.isOpen.set(true); 
    
    this.overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  
  close() { 
    if (!this.isOpen()) return;

    this.isOpen.set(false); 
    
    document.body.style.overflow = this.overflowAnterior;
  }
}