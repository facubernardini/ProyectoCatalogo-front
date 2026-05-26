import { Component, inject } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-vendedores',
  imports: [DatePipe, UpperCasePipe],
  templateUrl: './vendedores.html',
  styleUrl: './vendedores.css',
})
export class Vendedores {
  private adminStore = inject(AdminStoreService);

  vendedores = this.adminStore.vendedoresBackoffice;
}
