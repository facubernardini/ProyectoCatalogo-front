import { Component, HostListener, inject } from '@angular/core';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { Icon } from "@shared/components/icon";
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';

@Component({
  selector: 'app-confirm-dialog',
  imports: [Icon, SwipeDownDirective],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  public confirmService = inject(ConfirmService);

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: Event) {
    if (this.confirmService.isOpen()) {
      event.preventDefault(); 
      this.confirmService.confirm();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event) {
    if (this.confirmService.isOpen()) {
      event.preventDefault();
      this.confirmService.cancel();
    }
  }
}