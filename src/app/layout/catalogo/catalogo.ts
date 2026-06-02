import { Component, DOCUMENT, effect, inject, OnInit, Renderer2 } from '@angular/core';
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
import { BannerInfo } from "./banner-info/banner-info";
import { MapDialog } from "@shared/dialogs/map-dialog/map-dialog";
import { LoadingSpinner } from "@shared/components/loading-spinner/loading-spinner";

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule, Navbar, CarouselDestacados, ListaProductos,
    SearchNav, SearchProducts, Carrito, MenuInfo,
    ProductSelector, CarouselOfertas, Toast,
    MenuLateral,
    CategoryProductsView,
    BannerInfo,
    MapDialog,
    LoadingSpinner
],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoPublico implements OnInit {
  private route = inject(ActivatedRoute);
  public adminStore = inject(AdminStoreService);

  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const catalogo = this.adminStore.catalogo();
      
      const tema = catalogo?.tema?.toLowerCase() ?? 'midnight';
      
      this.renderer.setAttribute(this.document.documentElement, 'data-theme', tema);
    });
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.adminStore.cargarDatosPublicos(slug);
    }
    else {
      this.adminStore.isLoading.set(false);
    }
  }
}