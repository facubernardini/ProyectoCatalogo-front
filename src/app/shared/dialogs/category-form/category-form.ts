import { Component, effect, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CategoryFormService } from 'src/app/core/services/category-form.service';
import { Icon } from "@shared/components/icon";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-form',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {
  public categoryFormService = inject(CategoryFormService);

  public categoria = {
    nombre: '',
    activo: true
  };

  constructor() {
    effect(() => {
      const editing = this.categoryFormService.editingCategory();
      if (editing) {
        this.categoria = { 
          nombre: editing.nombre, 
          activo: editing.activo 
        };
      } else {
        this.categoria = { nombre: '', activo: true };
      }
    });
  }

  guardar() {
    this.categoryFormService.save();
  }

  eliminar() {
    const cat = this.categoryFormService.editingCategory();
    if (cat) {
      this.categoryFormService.delete(cat.id);
    }
  }
}
