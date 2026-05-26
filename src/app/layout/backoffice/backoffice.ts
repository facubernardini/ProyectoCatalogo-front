import { Component, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { LoadingSpinner } from "@shared/components/loading-spinner/loading-spinner";
import { RouterOutlet } from "@angular/router";
import { Toast } from "@shared/toast/toast";
import { ConfirmDialog } from "@shared/dialogs/confirm-dialog/confirm-dialog";
import { MenuInferiorBO } from "./menu-inferior-bo/menu-inferior-bo";

@Component({
  selector: 'app-backoffice',
  imports: [LoadingSpinner, RouterOutlet, Toast, ConfirmDialog, MenuInferiorBO],
  templateUrl: './backoffice.html',
  styleUrl: './backoffice.css',
})
export class Backoffice {
  public adminStore = inject(AdminStoreService);

  ngOnInit() {
    this.adminStore.cargarDatosPanelBackoffice();
  }
}
