import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from "./navbar/navbar";
import { CarouselDestacados } from "./carousel-destacados/carousel-destacados";
import { ActivatedRoute } from '@angular/router';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductoService } from 'src/app/core/services-backend/productos.service';
import { CatalogoService } from 'src/app/core/services-backend/catalogo.service';
import { Catalogo } from 'src/app/core/models/catalogo.model';
import { CategoriaService } from 'src/app/core/services-backend/categoriasVendedor.service';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { ListaProductos } from "@layout/catalogo/lista-productos/lista-productos";
import { SearchNav } from "./search-nav/search-nav";
import { SearchProducts } from "@shared/dialogs/search-products/search-products";
import { Carrito } from "@shared/dialogs/carrito/carrito";
import { MenuInfo } from "@shared/dialogs/menu-info/menu-info";
import { ProductSelector } from "@shared/dialogs/product-selector/product-selector";
import { CarouselOfertas } from "./carousel-ofertas/carousel-ofertas";
import { Toast } from "@shared/toast/toast";

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, Navbar, CarouselDestacados, ListaProductos, SearchNav, SearchProducts, Carrito, MenuInfo, ProductSelector, CarouselOfertas, Toast],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoPublico{  
  private route = inject(ActivatedRoute);

  private catalogoService = inject(CatalogoService);
  private productoService = inject(ProductoService);
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
    }
  }

  cargarCatalogoPorSlug(slug: string) {
    this.catalogoService.getCatalogoBySlug(slug).subscribe(res => {
      this.catalogo.set(res);
      if (res) {
        this.idCatalogo = res.id;
        this.cargarCategorias();
        this.cargarProductosPorSlug(slug);
      }
    });
  }

  cargarProductosPorSlug(slug: string) {
    this.productoService.getProductosBySlug(slug).subscribe(res => {
      this.productos.set(res);
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategoriasByCatalogo(this.idCatalogo, true).subscribe({
          next: (res) => this.categorias.set(res),
          error: (err) => console.error('Error al cargar categorías', err)
        });
  }
}