import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { InfoService } from 'src/app/core/services/info.service';

@Component({
  selector: 'app-navbar',
  imports: [Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  public adminStore = inject(AdminStoreService);
  public menuService = inject(InfoService);
}
