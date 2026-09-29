import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { InfoService } from '@shared/services/info.service';
import { CartService } from '@shared/services/cart.service';
import { MenuLateralService } from '@shared/services/menu-lateral.service';
import { SearchService } from '@shared/services/search.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar-indumentaria',
  imports: [Icon, RouterLink],
  templateUrl: './navbar-indumentaria.html',
  styleUrl: './navbar-indumentaria.css',
})
export class NavbarIndumentaria {
  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
  public cartService = inject(CartService);
  public menuService = inject(MenuLateralService);
  public searchService = inject(SearchService);

  abrirBuscador() {
    this.searchService.open();
  }
}