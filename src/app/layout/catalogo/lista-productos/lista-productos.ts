import { Component, input, signal } from '@angular/core';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-lista-productos',
  imports: [Icon],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css',
})
export class ListaProductos {
  categorias = input.required<CategoriaVendedor[]>();

  categoriaSeleccionada = signal<string>('todos');

  seleccionarCategoria(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
    // Aquí podrías disparar la lógica de filtrado del array de productos
  }

  abrirFiltros() {
    console.log('Abriendo filtros avanzados...');
    // Funcionalidad para implementar luego
  }
}
