import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { InfoService } from '@shared/services/info.service';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-navbar',
  imports: [Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
}
