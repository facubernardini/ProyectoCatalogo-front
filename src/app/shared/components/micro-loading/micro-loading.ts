import { Component, inject } from '@angular/core';
import { MicroLoadingService } from 'src/app/core/services/micro-loading.service';

@Component({
  selector: 'app-micro-loading',
  imports: [],
  templateUrl: './micro-loading.html',
  styleUrl: './micro-loading.css',
})
export class MicroLoading {
  public loadingService = inject(MicroLoadingService);
}
