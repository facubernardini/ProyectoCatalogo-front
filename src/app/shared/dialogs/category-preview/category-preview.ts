import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { Producto } from 'src/app/core/models/producto.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { CategoryPreviewService } from '@shared/services/category-preview.service';

@Component({
  selector: 'app-category-preview',
  imports: [CommonModule, FormsModule, SwipeDownDirective, Icon],
  templateUrl: './category-preview.html',
  styleUrl: './category-preview.css',
})
export class CategoryPreview {
  public categoryPreviewService = inject(CategoryPreviewService);
  private adminStore = inject(AdminStoreService);

  getProductosDeCategoria(categoriaId: number): Producto[] {
    if (!categoriaId) return [];
    
    return this.adminStore.productos().filter(prod => {
      if (!prod.categorias) return false;
      
      return prod.categorias.some((c: any) => c.id === categoriaId);
    });
  }

  onGuardarCategoria(categoria: CategoriaVendedor) {
    this.categoryPreviewService.onGuardar(categoria);
  }
}
