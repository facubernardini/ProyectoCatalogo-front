import { Component, effect, inject, signal } from '@angular/core';
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
  public adminStore = inject(AdminStoreService);

  public categoria = {
    nombre: '',
    activo: true,
    especial: false,
    imagen: '' as string | null
  };

  imagenArchivo = signal<File | null>(null);
  imagenPreviewTemporal = signal<string | null>(null);
  isUploading = signal(false);

  constructor() {
    effect(() => {
      const isOpen = this.categoryFormService.isOpen();
      const editing = this.categoryFormService.editingCategory();
      
      if (isOpen) {
        if (editing) {
          this.categoria = { 
            nombre: editing.nombre, 
            activo: editing.activo,
            especial: editing.especial ?? false,
            imagen: editing.imagen ?? null
          };
          this.categoryFormService.nombre.set(editing.nombre);
        } else {
          this.resetLocalForm();
        }
      } else {
        this.resetLocalForm();
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
    // 1. Leemos si el servicio ya traía un nombre pre-cargado
    const nombrePrecargado = this.categoryFormService.nombre();
    
    // 2. Reseteamos el estado local, pero conservando ese nombre inicial
    this.categoria = { 
        nombre: nombrePrecargado, 
        activo: true, 
        especial: false ,
        imagen: null
    };
    
    this.imagenArchivo.set(null);
    this.imagenPreviewTemporal.set(null);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenArchivo.set(file);
      
      // Creamos una URL temporal para mostrar la vista previa al instante
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreviewTemporal.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  guardar() {
    if (this.isNameDuplicate()) return;
    
    this.categoria.nombre = this.categoryFormService.nombre();
    const imagenPendiente = this.imagenArchivo();
    this.categoryFormService.save(this.categoria, imagenPendiente || undefined);
  }
}