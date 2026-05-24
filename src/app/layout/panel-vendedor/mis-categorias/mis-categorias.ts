import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { CategoryDeleteService } from '@shared/services/category-delete.service';
import { CategoryFormService } from '@shared/services/category-form.service';
import { CategoryPreviewService } from '@shared/services/category-preview.service';
import { CategoriaManagerService } from 'src/app/core/services/categoria-manager.service'; // <-- Nuevo Manager

@Component({
  selector: 'app-mis-categorias',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './mis-categorias.html',
  styleUrl: './mis-categorias.css',
})
export class MisCategorias {
  private adminStore = inject(AdminStoreService);
  private categoryFormService = inject(CategoryFormService);
  private categoryDeleteService = inject(CategoryDeleteService);
  private location = inject(Location);
  private confirmService = inject(ConfirmService);

  public categoriaManager = inject(CategoriaManagerService);
  public categoryPreview = inject(CategoryPreviewService);

  filtro = signal('');
  activeMenuId = signal<number | null>(null);
  
  categoriasFiltradas = computed(() => {
    const term = this.filtro().toLowerCase();
    const lista = this.adminStore.categorias();
    if (!term) return lista;
    return lista.filter(c => c.nombre.toLowerCase().includes(term));
  });

  onAddCategory() {
    this.categoryFormService.openCreate();
  }

  onEditCategory(categoria: CategoriaVendedor) {
    this.categoryFormService.openEdit(categoria);
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
  }

  @HostListener('document:click')
  closeMenu() {
    this.activeMenuId.set(null);
  }

  volverAtras() {
    this.location.back();
  }

  onToggleEspecial(categoria: CategoriaVendedor) {
    this.categoriaManager.toggleEspecial(categoria);
  }

  onToggleActiva(categoria: CategoriaVendedor) {
    this.categoriaManager.toggleActivo(categoria);
  }

  async onEliminar(categoria: CategoriaVendedor) {
    const productosAfectados = this.adminStore.productos().filter(p => 
      p.categorias?.length === 1 && p.categorias[0].id === categoria.id
    );

    // 1. Si no hay huérfanos, borrado directo
    if (productosAfectados.length === 0) {
      const confirm = await this.confirmService.ask({
        title: '¿Eliminar categoría?',
        message: `¿Estás seguro de eliminar "${categoria.nombre}"?`,
        icon: 'trash',
        type: 'danger'
      });

      if (!confirm) return;
      
      // Llamamos al manager pasando el ID y la acción por defecto
      this.categoriaManager.eliminar(categoria.id, 'eliminar');
      return;
    }

    // 2. Si hay huérfanos, el servicio se encarga de mostrar el modal especial
    const resultado = await this.categoryDeleteService.ask({
      categoria,
      productosAfectados: productosAfectados
    });

    if (!resultado) return;

    // 3. Ejecutamos usando el manager según lo que eligió en el modal
    this.categoriaManager.eliminar(categoria.id, resultado.accion, resultado.categoriaDestinoId);
  }
}