import { Component, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Location } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductoService } from 'src/app/core/services/productos.service';

@Component({
  selector: 'app-mis-productos',
  imports: [Icon],
  templateUrl: './mis-productos.html',
  styleUrl: './mis-productos.css',
})
export class MisProductos {
  productos = signal<Producto[]>([]);
  loading = signal<boolean>(true);

  private productoService = inject(ProductoService);
  private location = inject(Location);

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    const data = localStorage.getItem('vendedor');
    if (data) {
      const vendedor = JSON.parse(data);
      const catalogoId = vendedor.catalogo?.id;

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
    else{
      this.loading.set(false);
    }
  }

  volverAtras() {
    this.location.back();
  }
}
