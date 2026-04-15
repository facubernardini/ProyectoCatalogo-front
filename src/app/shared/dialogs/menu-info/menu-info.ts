import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { MenuService } from 'src/app/core/services/menu.service';
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
  public menuService = inject(MenuService);

  catalogo = this.adminStore.catalogo;
}
