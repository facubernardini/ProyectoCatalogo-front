import { Injectable, signal } from '@angular/core';

export type ConfirmType = 'danger' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  isOpen = signal(false);
  title = signal('');
  message = signal('');
  
  // Nuevos parámetros de personalización
  confirmText = signal('Aceptar');
  cancelText = signal('Cancelar');
  icon = signal('trash');
  type = signal<ConfirmType>('danger');

  private resolve: (value: boolean) => void = () => {};

  ask(options: { 
    title: string, 
    message: string, 
    confirmText?: string, 
    cancelText?: string, 
    icon?: string,
    type?: ConfirmType 
  }): Promise<boolean> {
    this.title.set(options.title);
    this.message.set(options.message);
    this.confirmText.set(options.confirmText || 'Aceptar');
    this.cancelText.set(options.cancelText || 'Cancelar');
    this.icon.set(options.icon || 'trash');
    this.type.set(options.type || 'danger');
    
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
    return new Promise((res) => { this.resolve = res; });
  }

  confirm() { 
    this.isOpen.set(false);
    this.resolve(true);
    document.body.style.overflow = 'auto';
  }

  cancel() { 
    this.isOpen.set(false);
    this.resolve(false);
    document.body.style.overflow = 'auto';
  }
}