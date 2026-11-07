import { Component, effect, inject, signal, untracked } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryFormService } from '@shared/services/category-form.service';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-category-form',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {
  public categoryFormService = inject(CategoryFormService);
  public adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);

  public categoria = {
    nombre: '',
    activo: true,
    especial: false,
    imagen: '' as string | null,
    es_agrupadora: false,
    parent_id: null as number | null
  };

  imagenArchivo = signal<File | null>(null);
  imagenPreviewTemporal = signal<string | null>(null);
  isUploading = signal(false);

  isDropdownPadreOpen = signal(false);

  constructor() {
    effect(() => {
      const isOpen = this.categoryFormService.isOpen();
      const editing = this.categoryFormService.editingCategory();
      
      untracked(() => {
        if (isOpen) {
          if (editing) {
            this.categoria = { 
              nombre: editing.nombre, 
              activo: editing.activo,
              especial: editing.especial ?? false,
              imagen: editing.imagen ?? null,
              es_agrupadora: editing.es_agrupadora ?? false,
              parent_id: editing.parent_id ?? null
            };
            this.categoryFormService.nombre.set(editing.nombre);
          } else {
            this.resetLocalForm();
          }
        } else {
          this.resetLocalForm();
        }
      });
    });
  }

  // --- NUEVA LÓGICA DE JERARQUÍA ---

  // Obtiene solo las categorías agrupadoras para el dropdown (excluyendo la que estamos editando para evitar bucles)
  get categoriasPadrePosibles() {
    const editingId = this.categoryFormService.editingCategory()?.id;
    return this.adminStore.categorias().filter(c => 
      c.es_agrupadora && c.id !== editingId
    );
  }

  // Define si el usuario tiene permitido tocar el switch de "Es Agrupadora"
  get canToggleAgrupadora(): boolean {
    const editing = this.categoryFormService.editingCategory();
    if (!editing) return true;
    
    if (editing.productos_count > 0) return false;
    
    if ((editing.subcategorias?.length ?? 0) > 0) return false;

    return true;
  }

  toggleAgrupadora() {
    if (!this.canToggleAgrupadora) return;
    
    this.categoria.es_agrupadora = !this.categoria.es_agrupadora;
    
    if (this.categoria.es_agrupadora) {
      this.categoria.parent_id = null;
    }
  }

  getNombrePadreSeleccionado(): string {
    const parentId = this.categoria.parent_id;
    if (parentId === null) return 'Ninguna';
    
    const padre = this.categoriasPadrePosibles.find(p => p.id === parentId);
    return padre ? padre.nombre : 'Ninguna';
  }

  toggleDropdownPadre() {
    this.isDropdownPadreOpen.update(v => !v);
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
    const nombrePrecargado = this.categoryFormService.nombre();
    
    this.categoria = { 
      nombre: nombrePrecargado, 
      activo: true, 
      especial: false,
      imagen: null,
      es_agrupadora: false,
      parent_id: this.categoryFormService.parentId()
    };
    
    this.imagenArchivo.set(null);
    this.imagenPreviewTemporal.set(null);
  }

  onFileChange(event: any) {
    const inputEl = event.target;
    const file = inputEl.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastService.show('Formato no soportado. Por favor subí un archivo de imagen válido.', 'error');
        inputEl.value = '';
        return;
      }
      this.imagenArchivo.set(file);
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