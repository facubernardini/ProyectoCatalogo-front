import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Navbar } from "./navbar/navbar";
import { ListaProductos } from "@layout/catalogo/lista-productos/lista-productos";
import { CarouselDestacados } from "./carousel-destacados/carousel-destacados";
import { CarouselOfertas } from "./carousel-ofertas/carousel-ofertas";
import { SearchNav } from "./search-nav/search-nav";
import { Toast } from "@shared/toast/toast";
import { SearchProducts } from "@shared/dialogs/search-products/search-products";
import { Carrito } from "@shared/dialogs/carrito/carrito";
import { MenuInfo } from "@shared/dialogs/menu-info/menu-info";
import { ProductSelector } from "@shared/dialogs/product-selector/product-selector";
import { MenuLateral } from "@shared/dialogs/menu-lateral/menu-lateral";
import { CategoryProductsView } from "@shared/dialogs/category-products-view/category-products-view";

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule, Navbar, CarouselDestacados, ListaProductos,
    SearchNav, SearchProducts, Carrito, MenuInfo,
    ProductSelector, CarouselOfertas, Toast,
    MenuLateral,
    CategoryProductsView
],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoPublico implements OnInit {  
  private route = inject(ActivatedRoute);
  public adminStore = inject(AdminStoreService);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.adminStore.cargarDatosPublicos(slug);
    }
  }
}