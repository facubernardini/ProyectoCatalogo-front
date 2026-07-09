import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [Icon],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast {
  public toastService = inject(ToastService);
}
