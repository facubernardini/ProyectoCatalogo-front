import { Component, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { LoadingSpinner } from "@shared/components/loading-spinner/loading-spinner";
import { RouterOutlet } from "@angular/router";
import { Toast } from "src/app/shared/components/toast/toast";
import { ConfirmDialog } from "@shared/dialogs/confirm-dialog/confirm-dialog";
import { MenuInferiorBO } from "./menu-inferior-bo/menu-inferior-bo";
import { HistorialSuscripciones } from "@shared/dialogs/historial-suscripciones/historial-suscripciones";
import { AdminSub } from "@shared/dialogs/admin-sub/admin-sub";
import { Title } from '@angular/platform-browser';
import { BRAND_DATA } from 'src/app/core/data/brand.data';

@Component({
  selector: 'app-backoffice',
  imports: [LoadingSpinner, RouterOutlet, Toast, ConfirmDialog, MenuInferiorBO, HistorialSuscripciones, AdminSub],
  templateUrl: './backoffice.html',
  styleUrl: './backoffice.css',
})
export class Backoffice {
  public adminStore = inject(AdminStoreService);
  private titleService = inject(Title);

  ngOnInit() {
    this.adminStore.cargarDatosPanelBackoffice();
    this.titleService.setTitle(`${BRAND_DATA.name} - Backoffice`);
  }
}
