import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule, Location } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { FormsModule } from '@angular/forms';
import { CategoryFormService } from 'src/app/core/services/category-form.service';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { CategoriaService } from 'src/app/core/services-backend/categorias.ServiceBackend';

@Component({
  selector: 'app-mis-categorias',
  imports: [Icon, CommonModule, FormsModule,],
  templateUrl: './mis-categorias.html',
  styleUrl: './mis-categorias.css',
})
export class MisCategorias {
  private adminStore = inject(AdminStoreService);
  private categoryFormService = inject(CategoryFormService);
  private toastService = inject(ToastService);
  private categoriaBackend = inject(CategoriaService);

  public confirmService = inject(ConfirmService);

  filtro = signal('');
  activeMenuId = signal<number | null>(null);
  
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

  async onEliminar(categoria: CategoriaVendedor) {
    const confirm = await this.confirmService.ask({
      title: '¿Eliminar categoría?',
      message: `¿Estás seguro de eliminar "${categoria.nombre}"? Los productos no se borrarán, pero quedarán sin categoría.`,
      icon: 'trash',
      type: 'danger'
    });

    if (!confirm) return;

    this.categoriaBackend.deleteCategoria(categoria.id).subscribe(() => {
      this.adminStore.eliminarCategoriaDeLista(categoria.id);
      this.toastService.show('Categoría eliminada');
    });
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

  async onToggleEspecial(categoria: CategoriaVendedor) {
    const esEspecial = categoria.especial;
    const confirm = await this.confirmService.ask({
      title: esEspecial ? '¿Quitar categoría especial?' : '¿Hacer categoría especial?',
      message: 'Las categorías especiales aparecen al inicio del listado para tus clientes.',
      icon: 'star',
      type: 'info'
    });

    if (!confirm) return;

    this.categoriaBackend.updateCategoria(categoria.id, { especial: !esEspecial }).subscribe((actualizada) => {
      this.adminStore.updateCategoriaEnLista(actualizada);
      this.toastService.show(esEspecial ? 'Ya no es especial' : '¡Categoría especial!');
    });
  }

  async onToggleActiva(cat: CategoriaVendedor) {
    const estaActiva = cat.activo;
    const confirm = await this.confirmService.ask({
      title: estaActiva ? '¿Desactivar categoría?' : '¿Activar categoría?',
      message: estaActiva ? 'Los productos de esta categoría dejarán de ser visibles.' : 'La categoría volverá a estar visible.',
      icon: estaActiva ? 'pause' : 'play',
      type: 'warning'
    });

    if (!confirm) return;

    this.categoriaBackend.updateCategoria(cat.id, { activo: !estaActiva }).subscribe((actualizada) => {
      this.adminStore.updateCategoriaEnLista(actualizada);
      this.toastService.show(estaActiva ? 'Categoría desactivada' : 'Categoría activada');
    });
  }
}
