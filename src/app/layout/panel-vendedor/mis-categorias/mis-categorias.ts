import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { CategoriaService } from 'src/app/core/services-backend/categorias.ServiceBackend';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { CategoryDeleteService } from '@shared/services/category-delete.service';
import { CategoryFormService } from '@shared/services/category-form.service';
import { CategoryPreviewService } from '@shared/services/category-preview.service';

@Component({
  selector: 'app-mis-categorias',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './mis-categorias.html',
  styleUrl: './mis-categorias.css',
})
export class MisCategorias {
  private adminStore = inject(AdminStoreService);
  private categoryFormService = inject(CategoryFormService);
  private toastService = inject(ToastService);
  private categoriaBackend = inject(CategoriaService);
  private categoryDeleteService = inject(CategoryDeleteService);
  private location = inject(Location);
  private confirmService = inject(ConfirmService);
  
  public categoryPreview = inject(CategoryPreviewService);

  filtro = signal('');
  activeMenuId = signal<number | null>(null);
  
  categoriasFiltradas = computed(() => {
    const term = this.filtro().toLowerCase();
    const lista = this.adminStore.categorias();
    if (!term) return lista;
    return lista.filter(c => c.nombre.toLowerCase().includes(term));
  });

  onEditCategory(categoria: CategoriaVendedor) {
    this.categoryFormService.openEdit(categoria);
  }

  onAddCategory() {
    this.categoryFormService.openCreate();
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
      this.ejecutarBorrado(categoria.id, 'eliminar');
      return;
    }

    // 2. Si hay huérfanos, el servicio se encarga de mostrar el modal y esperar
    const resultado = await this.categoryDeleteService.ask({
      categoria,
      productosAfectados: productosAfectados
    });

    // Si el usuario clickeó Cancelar o hizo clic afuera, resultado es null
    if (!resultado) return;

    // 3. Ejecutamos según lo que eligió en el modal
    this.ejecutarBorrado(categoria.id, resultado.accion, resultado.categoriaDestinoId);
  }

  private ejecutarBorrado(categoriaId: number, accionProductos: 'mover' | 'eliminar', categoriaDestino?: number) {
    this.categoriaBackend.deleteCategoria(categoriaId, accionProductos, categoriaDestino).subscribe({
      next: () => {
        // A. Borramos la categoría del Store
        this.adminStore.eliminarCategoriaDeLista(categoriaId);
        
        // B. Actualizamos los productos en el Store local para que la UI reaccione
        if (accionProductos === 'mover' && categoriaDestino) {
          this.adminStore.moverProductosACategoria(categoriaId, categoriaDestino);
        } else if (accionProductos === 'eliminar') {
          this.adminStore.eliminarProductosPorCategoria(categoriaId);
        }
        
        this.toastService.show('Categoría eliminada con éxito');
        
        // C. NOTA: Ya no llamamos a cerrarModalEliminar() porque el CategoryDeleteService 
        // ya lo cerró por su cuenta antes de devolvernos la Promesa.
      },
      error: () => this.toastService.show('Error al eliminar', 'error')
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
      title: esEspecial ? '¿Quitar de destacadas?' : '¿Destacar categoría?',
      message: 'Las categorías especiales aparecen al inicio del listado para tus clientes.',
      icon: 'star',
      type: 'info'
    });

    if (!confirm) return;

    this.categoriaBackend.updateCategoria(categoria.id, { especial: !esEspecial }).subscribe((actualizada) => {
      this.adminStore.updateCategoriaEnLista(actualizada);
      this.toastService.show('Categoría actualizada');
    });
  }

  async onToggleActiva(cat: CategoriaVendedor) {
    const estaActiva = cat.activo;
    const confirm = await this.confirmService.ask({
      title: estaActiva ? '¿Pausar categoría?' : '¿Reanudar categoría?',
      message: estaActiva ? 'Los productos de esta categoría dejarán de ser visibles.' : 'La categoría volverá a estar visible.',
      icon: estaActiva ? 'pause' : 'play',
      type: 'warning'
    });

    if (!confirm) return;

    this.categoriaBackend.updateCategoria(cat.id, { activo: !estaActiva }).subscribe((actualizada) => {
      this.adminStore.updateCategoriaEnLista(actualizada);
      this.toastService.show(estaActiva ? 'Categoría pausada' : 'Categoría reanudada');
    });
  }
}
