import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryDeleteService } from '@shared/services/category-delete.service';

@Component({
  selector: 'app-category-delete',
  imports: [CommonModule, FormsModule],
  templateUrl: './category-delete.html',
  styleUrl: './category-delete.css', 
})
export class CategoryDelete {
  public categoryDeleteService = inject(CategoryDeleteService);
}