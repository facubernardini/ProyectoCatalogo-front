import { Component, inject, input } from '@angular/core';
import { Catalogo } from 'src/app/core/models/catalogo.model';
import { Icon } from "@shared/components/icon";
import { MenuService } from 'src/app/core/services/menu.service';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';

@Component({
  selector: 'app-menu-info',
  imports: [Icon, SwipeDownDirective],
  templateUrl: './menu-info.html',
  styleUrl: './menu-info.css',
})
export class MenuInfo {
  catalogo = input<Catalogo | null>(null);

  public menuService = inject(MenuService);
  
}
