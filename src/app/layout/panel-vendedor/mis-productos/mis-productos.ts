import { Component, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Location } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductFormService } from 'src/app/core/services/product-form.service';

@Component({
  selector: 'app-mis-productos',
  imports: [Icon],
  templateUrl: './mis-productos.html',
  styleUrl: './mis-productos.css',
})
export class MisProductos {
  adminStore = inject(AdminStoreService);

  productos = this.adminStore.productos; 
  categorias = this.adminStore.categorias;

  categoriaSeleccionada = signal<string>('todos');

  private location = inject(Location);
  formService = inject(ProductFormService);

  abrirFiltros() {
    throw new Error('Method not implemented.');
  }

  seleccionarCategoria(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
    throw new Error('Method not implemented.');
  }

  volverAtras() {
    this.location.back();
  }

  onAdd() {
    this.formService.openCreate();
  }

  onEdit(prod: Producto) {
    this.formService.openEdit(prod);
  }

  onView(_t35: Producto) {
    
  }

  onToggleStatus(_t35: Producto) {
    throw new Error('Method not implemented.');
  }

  onToggleFeatured(_t35: Producto) {
    throw new Error('Method not implemented.');
  }
}
