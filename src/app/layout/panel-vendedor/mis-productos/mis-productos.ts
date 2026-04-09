import { Component, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Location } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductoService } from 'src/app/core/services-backend/productos.service';
import { CategoriaService } from 'src/app/core/services-backend/categoriasVendedor.service';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';

@Component({
  selector: 'app-mis-productos',
  imports: [Icon],
  templateUrl: './mis-productos.html',
  styleUrl: './mis-productos.css',
})
export class MisProductos {
  productos = signal<Producto[]>([]);
  loading = signal<boolean>(true);

  categorias = signal<CategoriaVendedor[]>([]);
  categoriaSeleccionada = signal<string>('todos');

  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private location = inject(Location);

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    const data = localStorage.getItem('vendedor');
    if (data) {
      const { catalogo } = JSON.parse(data);
      if (catalogo?.id) {
        this.cargarProductos(catalogo.id);
        
        this.categoriaService.getCategoriasByCatalogo(catalogo.id).subscribe({
          next: (res) => this.categorias.set(res),
          error: (err) => console.error('Error al cargar categorías', err)
        });
      }
    }
    else{
      this.loading.set(false);
    }
  }

  cargarProductos(catalogoId: number) {
    if (catalogoId) {
      this.productoService.getProductosByCatalogo(catalogoId).subscribe({
        next: (res) => {
          this.productos.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar productos', err);
          this.loading.set(false);
        }
      });
    }
  }

  seleccionarCategoria(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
    // Aquí podrías disparar la lógica de filtrado del array de productos
  }

  abrirFiltros() {
    console.log('Abriendo filtros avanzados...');
    // Funcionalidad para implementar luego
  }

  volverAtras() {
    this.location.back();
  }
}
