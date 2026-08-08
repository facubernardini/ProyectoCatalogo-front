import { Component, effect, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryFormService } from '@shared/services/category-form.service';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-category-form',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {
  public categoryFormService = inject(CategoryFormService);
  private adminStore = inject(AdminStoreService);

  public categoria = {
    nombre: '',
    activo: true,
    especial: false
  };

  constructor() {
    effect(() => {
      const isOpen = this.categoryFormService.isOpen();
      const editing = this.categoryFormService.editingCategory();
      
      if (isOpen) {
        if (editing) {
          this.categoria = { 
            nombre: editing.nombre, 
            activo: editing.activo,
            especial: editing.especial ?? false
          };
          this.categoryFormService.nombre.set(editing.nombre);
        } else {
          this.resetLocalForm();
        }
      }
    });
  }

  isNameDuplicate(): boolean {
    const currentName = this.categoryFormService.nombre().trim().toLowerCase();
    
    if (!currentName) return false;
    
    const editingCategory = this.categoryFormService.editingCategory();
    
    if (editingCategory && currentName === editingCategory.nombre.trim().toLowerCase()) {
        return false;
    }
    
    return this.adminStore.categorias().some(cat => 
        cat.nombre.trim().toLowerCase() === currentName
    );
  }

  private resetLocalForm() {
    this.categoria = { nombre: '', activo: true, especial: false };
    this.categoryFormService.nombre.set('');
  }

  guardar() {
    if (this.isNameDuplicate()) return;
    
    this.categoria.nombre = this.categoryFormService.nombre();
    this.categoryFormService.save(this.categoria);
  }
}