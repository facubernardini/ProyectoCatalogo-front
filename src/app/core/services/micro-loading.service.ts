import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MicroLoadingService {
  public isWorking = signal<boolean>(false);
  public isHiding = signal<boolean>(false);
  public message = signal<string>('');

  show(msg: string = '') {
    this.message.set(msg);
    this.isHiding.set(false);
    this.isWorking.set(true);
  }

  hide() {
    if (!this.isWorking()) return;

    this.isHiding.set(true);

    setTimeout(() => {
      this.isWorking.set(false);
      this.isHiding.set(false);
    }, 200); 
  }
}