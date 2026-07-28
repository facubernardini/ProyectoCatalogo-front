import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageViewerService {
  isOpen = signal<boolean>(false);
  imageUrl = signal<string | null>(null);
  
  private closeTimeoutId: any = null; 

  open(url: string) {
    if (!url) return;
    
    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId);
      this.closeTimeoutId = null;
    }

    this.imageUrl.set(url);
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    
    this.closeTimeoutId = setTimeout(() => {
      this.imageUrl.set(null);
      this.closeTimeoutId = null;
    }, 300);
  }
}