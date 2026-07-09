import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { InfoService } from '@shared/services/info.service';
import { MapDialogService } from '@shared/services/map.service';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-menu-info',
  imports: [Icon, SwipeDownDirective],
  templateUrl: './menu-info.html',
  styleUrl: './menu-info.css',
})
export class MenuInfo {
  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
  public mapDialogService = inject(MapDialogService);

  catalogo = this.adminStore.catalogo;
}
