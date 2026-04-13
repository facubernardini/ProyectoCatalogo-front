import { Component, computed, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule, Location } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { FormsModule } from '@angular/forms';
import { CategoryFormService } from 'src/app/core/services/category-form.service';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';

@Component({
  selector: 'app-mis-categorias',
  imports: [Icon, CommonModule, FormsModule,],
  templateUrl: './mis-categorias.html',
  styleUrl: './mis-categorias.css',
})
export class MisCategorias {
  adminStore = inject(AdminStoreService);

  categoryFormService = inject(CategoryFormService);

  filtro = signal('');
  
  categoriasFiltradas = computed(() => {
    const term = this.filtro().toLowerCase();
    const lista = this.adminStore.categorias();
    
    if (!term) return lista;
    
    return lista.filter(c => c.nombre.toLowerCase().includes(term));
  });

  private location = inject(Location);

  onEditCategory(categoria: CategoriaVendedor) {
    this.categoryFormService.openEdit(categoria);
  }

  onAddCategory() {
    this.categoryFormService.openCreate();
  }

  volverAtras() {
    this.location.back();
  }
}
