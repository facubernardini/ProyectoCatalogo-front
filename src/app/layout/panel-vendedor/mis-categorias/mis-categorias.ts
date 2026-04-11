import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Location } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-mis-categorias',
  imports: [Icon],
  templateUrl: './mis-categorias.html',
  styleUrl: './mis-categorias.css',
})
export class MisCategorias {
  adminStore = inject(AdminStoreService);
  
  categorias = this.adminStore.categorias;

  private location = inject(Location);

  volverAtras() {
    this.location.back();
  }
}
