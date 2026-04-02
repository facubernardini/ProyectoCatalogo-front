import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from "./navbar/navbar";
import { CarrouselDestacados } from "./carrousel-destacados/carrousel-destacados";
import { ActivatedRoute } from '@angular/router';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductoService } from 'src/app/core/services/productos.service';
import { CatalogoService } from 'src/app/core/services/catalogo.service';
import { Catalogo } from 'src/app/core/models/catalogo.model';
import { CategoriaService } from 'src/app/core/services/categoriasVendedor.service';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { ListaProductos } from "@layout/catalogo/lista-productos/lista-productos";
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, Navbar, CarrouselDestacados, ListaProductos, Icon],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoPublico {
  private route = inject(ActivatedRoute);

  private productoService = inject(ProductoService);
  private catalogoService = inject(CatalogoService);
  private categoriaService = inject(CategoriaService);
  
  catalogo = signal<Catalogo | null>(null);
  productos = signal<Producto[]>([]);
  categorias = signal<CategoriaVendedor[]>([]);

  productosDestacados = computed(() => 
    this.productos().filter(p => p.destacado)
  );

  private idCatalogo!: number;
  
  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    
    if (slug) {
      this.cargarCatalogoPorSlug(slug);
      this.cargarProductosPorSlug(slug);
    }
  }

  cargarCatalogoPorSlug(slug: string) {
    this.catalogoService.getCatalogoBySlug(slug).subscribe(res => {
      this.catalogo.set(res);
      if (res) { 
        this.idCatalogo = res.id;
        this.cargarCategorias();
      }
    });
  }

  cargarProductosPorSlug(slug: string) {
    this.productoService.getProductosBySlug(slug).subscribe(res => {
      this.productos.set(res);
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategoriasByCatalogo(this.idCatalogo).subscribe({
          next: (res) => this.categorias.set(res),
          error: (err) => console.error('Error al cargar categorías', err)
        });
  }

}
