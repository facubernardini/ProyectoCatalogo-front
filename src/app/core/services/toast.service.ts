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
    
    // 1. Lo agregamos (invisible al principio)
    this.toasts.update(prev => [...prev, { id, message, type, visible: false }]);

    // 2. Un pequeño tick para que el navegador detecte el cambio y dispare el fade-in
    setTimeout(() => {
      this.toasts.update(list => list.map(t => t.id === id ? { ...t, visible: true } : t));
    }, 10);

    // 3. A los 2.7s empezamos el fade-out (ponemos visible en false)
    setTimeout(() => {
      this.toasts.update(list => list.map(t => t.id === id ? { ...t, visible: false } : t));
    }, 3500);

    // 4. A los 3s lo borramos definitivamente del DOM
    setTimeout(() => {
      this.toasts.update(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }
}