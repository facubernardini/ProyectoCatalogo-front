import { Component, inject } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-catalogos',
  imports: [DatePipe, UpperCasePipe],
  templateUrl: './catalogos.html',
  styleUrl: './catalogos.css',
})
export class Catalogos {
  private adminStore = inject(AdminStoreService);
  
  catalogos = this.adminStore.catalogosBackoffice;
}
