import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule, Location } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductoManagerService } from 'src/app/core/services/producto-manager.service';
import { FormsModule } from '@angular/forms';
import { ProductFormService } from '@shared/services/product-form.service';
import { ProductPreviewService } from '@shared/services/product-preview.service';

@Component({
  selector: 'app-mis-productos',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './mis-productos.html',
  styleUrl: './mis-productos.css',
})
export class MisProductos {
  private adminStore = inject(AdminStoreService);
  private location = inject(Location);
  private productFormService = inject(ProductFormService);
  
  public productManager = inject(ProductoManagerService); 
  public productPreviewService = inject(ProductPreviewService);

  productos = this.adminStore.productos; 
  categorias = this.adminStore.categorias;

  categoriaSeleccionada = signal<string>('todos');
  activeMenuId = signal<number | null>(null);
  filtro = signal<string>('');

  productosFiltrados = computed(() => {
    const seleccion = this.categoriaSeleccionada();
    const term = this.filtro().toLowerCase();
    
    let lista = this.adminStore.productos();

    if (seleccion !== 'todos') {
      lista = lista.filter(prod => prod.categorias?.some(c => c.nombre === seleccion));
    }

    if (term) {
      lista = lista.filter(prod => prod.nombre.toLowerCase().includes(term));
    }

    return lista;
  });

  categoriasOrdenadas = computed(() => {
    const lista = this.adminStore.categorias();
    return [...lista].sort((a, b) => Number(b.especial) - Number(a.especial));
  });

  seleccionarCategoria(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
  }

  volverAtras() {
    this.location.back();
  }

  onAdd() {
    this.productFormService.openCreate();
  }

  onEdit(prod: Producto, event: Event) {
    event.stopPropagation();
    this.productFormService.openEdit(prod);
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
  }

  @HostListener('document:click')
  closeMenu() {
    this.activeMenuId.set(null);
  }

  // --- MÉTODOS DELEGADOS AL MANAGER ---

  onEliminar(producto: Producto) {
    this.productManager.eliminar(producto);
  }
  
  onToggleActivo(producto: Producto) {
    this.productManager.toggleActivo(producto);
  }

  onDestacar(producto: Producto) {
    this.productManager.toggleDestacado(producto);
  }

  onDuplicar(producto: Producto) {
    this.productManager.duplicar(producto);
  }
}