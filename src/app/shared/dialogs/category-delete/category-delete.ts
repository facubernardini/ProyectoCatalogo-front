import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from "@shared/components/icon";
import { CategoryDeleteService } from 'src/app/core/services/category-delete.service';

@Component({
  selector: 'app-category-delete',
  imports: [CommonModule, FormsModule, Icon],
  templateUrl: './category-delete.html',
  styleUrl: './category-delete.css', 
})
export class CategoryDelete {
  public categoryDeleteService = inject(CategoryDeleteService);
}