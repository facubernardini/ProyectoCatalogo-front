import { Component, inject } from '@angular/core';
import { CuponFormService } from 'src/app/core/services/cupon-form.service';
import { Icon } from "@shared/components/icon";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cupon-form',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './cupon-form.html',
  styleUrl: './cupon-form.css',
})
export class CuponForm {
  public formService = inject(CuponFormService);
}
