import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'input[type="number"]',
  standalone: true
})
export class DisableNumberScrollDirective {
  
  @HostListener('wheel', ['$event'])
  onWheel(event: Event) {
    (event.target as HTMLElement).blur();
  }
}