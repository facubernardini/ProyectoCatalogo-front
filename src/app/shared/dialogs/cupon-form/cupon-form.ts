import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuponFormService } from '@shared/services/cupon-form.service';

@Component({
  selector: 'app-cupon-form',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './cupon-form.html',
  styleUrl: './cupon-form.css',
})
export class CuponForm {
  public formService = inject(CuponFormService);
}
