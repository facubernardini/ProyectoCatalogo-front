import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {

  playSuccess() {
    const audio = new Audio('assets/sounds/success.mp3');
    
    audio.play().catch(err => console.log('Reproducción de audio bloqueada:', err));
  }
}