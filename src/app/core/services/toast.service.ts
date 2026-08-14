import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: number;
  initialMessage: string;
  finalMessage: string;
  type: ToastType;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private idCounter = 0;

  show(message: string, type: ToastType = 'success'): number {
    const id = ++this.idCounter;
    
    this.toasts.update(prev => [...prev, { id, initialMessage: message, finalMessage: '', type, visible: false }]);

    setTimeout(() => {
      this.toasts.update(list => list.map(t => t.id === id ? { ...t, visible: true } : t));
    }, 10);

    if (type !== 'loading') {
      this.scheduleRemoval(id);
    }

    return id;
  }

  loading(message: string) {
    const id = this.show(message, 'loading');
    
    return {
      success: (msg: string) => this.update(id, msg, 'success'),
      error: (msg: string) => this.update(id, msg, 'error'),
      close: () => this.scheduleRemoval(id, 0) 
    };
  }

  private update(id: number, finalMessage: string, type: ToastType) {
    this.toasts.update(list => list.map(t => 
      t.id === id ? { ...t, finalMessage, type } : t
    ));
    
    this.scheduleRemoval(id);
  }

  private scheduleRemoval(id: number, delayMs: number = 3000) {
    setTimeout(() => {
      this.toasts.update(list => list.map(t => t.id === id ? { ...t, visible: false } : t));
    }, delayMs); 

    setTimeout(() => {
      this.toasts.update(prev => prev.filter(t => t.id !== id));
    }, delayMs + 300);
  }
}