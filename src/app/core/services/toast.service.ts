import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' = 'success') {
    const id = Date.now();
    
    this.toasts.update(prev => [...prev, { id, message, type, visible: false }]);

    setTimeout(() => {
      this.toasts.update(list => list.map(t => t.id === id ? { ...t, visible: true } : t));
    }, 10);

    setTimeout(() => {
      this.toasts.update(list => list.map(t => t.id === id ? { ...t, visible: false } : t));
    }, 3000); 

    setTimeout(() => {
      this.toasts.update(prev => prev.filter(t => t.id !== id));
    }, 3300);
  }
}