import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { InfoService } from '@shared/services/info.service';
import { CartService } from '@shared/services/cart.service';
import { BannerInfoDesktop } from "../banner-info-desktop/banner-info-desktop";
import { SearchDesktopService } from 'src/app/shared/services/search-desktop.service';
import { MenuLateralDesktopService } from 'src/app/shared/services/menu-lateral-desktop.service';

@Component({
  selector: 'app-navbar-desktop',
  imports: [Icon, BannerInfoDesktop],
  templateUrl: './navbar-desktop.html',
  styleUrl: './navbar-desktop.css',
})
export class NavbarDesktop {
  @ViewChild('sentinel') sentinel!: ElementRef;

  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
  public searchDesktopService = inject(SearchDesktopService); 
  public cartService = inject(CartService);
  public menuLateralService = inject(MenuLateralDesktopService);

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.searchDesktopService.actualizarBusqueda(value);
  }

  clearSearch() {
    this.searchDesktopService.limpiarBusqueda();
  }
}