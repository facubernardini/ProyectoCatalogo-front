import { Component, DOCUMENT, effect, HostListener, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Navbar } from "./navbar/navbar";
import { ListaProductos } from "@layout/catalogo/lista-productos/lista-productos";
import { CarouselDestacados } from "./carousel-destacados/carousel-destacados";
import { CarouselOfertas } from "./carousel-ofertas/carousel-ofertas";
import { SearchNav } from "./search-nav/search-nav";
import { Toast } from "src/app/shared/components/toast/toast";
import { SearchProducts } from "@shared/dialogs/search-products/search-products";
import { Carrito } from "@shared/dialogs/carrito/carrito";
import { MenuInfo } from "@shared/dialogs/menu-info/menu-info";
import { ProductSelector } from "@shared/dialogs/product-selector/product-selector";
import { MenuLateral } from "@shared/dialogs/menu-lateral/menu-lateral";
import { CategoryProductsView } from "@shared/dialogs/category-products-view/category-products-view";
import { BannerInfo } from "./banner-info/banner-info";
import { MapDialog } from "@shared/dialogs/map-dialog/map-dialog";
import { ProductosDestacados } from "@shared/dialogs/productos-destacados/productos-destacados";
import { ProductosOfertas } from "@shared/dialogs/productos-ofertas/productos-ofertas";
import { Skeleton } from "./skeleton/skeleton";
import { PedidoRealizado } from "@shared/dialogs/pedido-realizado/pedido-realizado";
import { Title } from '@angular/platform-browser';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { NavbarDesktop } from "./navbar-desktop/navbar-desktop";
import { MenuLateralDesktop } from "./menu-lateral-desktop/menu-lateral-desktop";
import { CarouselDestacadosDesktop } from "./carousel-destacados-desktop/carousel-destacados-desktop";
import { CarouselOfertasDesktop } from "./carousel-ofertas-desktop/carousel-ofertas-desktop";
import { ListaProductosDesktop } from "./lista-productos-desktop/lista-productos-desktop";
import { FooterDesktop } from "./footer-desktop/footer-desktop";
import { ExploradorProductosDesktop } from "./explorador-productos-desktop/explorador-productos-desktop";
import { ExploradorProductosService } from 'src/app/shared/services/explorador-productos.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { ConfirmDialog } from "src/app/shared/dialogs/confirm-dialog/confirm-dialog";
import { Router } from '@angular/router';
import { isDominioBase } from 'src/app/core/data/domains.data';
import { ImageViewer } from "src/app/shared/dialogs/image-viewer/image-viewer";

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
    ProductosDestacados,
    ProductosOfertas,
    Skeleton,
    PedidoRealizado,
    NavbarDesktop,
    MenuLateralDesktop,
    CarouselDestacadosDesktop,
    CarouselOfertasDesktop,
    ListaProductosDesktop,
    FooterDesktop,
    ExploradorProductosDesktop,
    ConfirmDialog,
    ImageViewer
],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoPublico implements OnInit, OnDestroy {
  private router = inject(Router);
  private titleService = inject(Title);
  public adminStore = inject(AdminStoreService);
  public exploradorProductosService = inject(ExploradorProductosService);
  public cartService = inject(CartService);

  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  isDesktop = signal(window.innerWidth >= 768);

  @HostListener('window:resize')
  onResize() {
    this.isDesktop.set(window.innerWidth >= 768);
  }

  constructor() {
    effect(() => {
      const faviconElement = this.document.getElementById('app-favicon') as HTMLLinkElement;
      const catalogo = this.adminStore.catalogo();
      
      const tema = catalogo?.tema?.toLowerCase() ?? 'midnight';
      this.renderer.setAttribute(this.document.documentElement, 'data-theme', tema);

      if (catalogo?.nombre_tienda) {
        this.titleService.setTitle(`${catalogo.nombre_tienda}`);
      } else {
        this.titleService.setTitle(`${BRAND_DATA.name}`);
      }

      if (catalogo?.logo_tienda && faviconElement) {
        faviconElement.href = catalogo.logo_tienda;
      }
      
    });

    effect(() => {
      if (this.adminStore.isLoading()) {
        this.renderer.addClass(this.document.body, 'overflow-hidden');
      } else {
        this.renderer.removeClass(this.document.body, 'overflow-hidden');
      }
    });
  }

  ngOnInit() {
    const slug = this.obtenerSlugDesdeSubdominio();

    if (slug) {
      this.renderer.addClass(this.document.body, 'tema-catalogo');
      this.adminStore.cargarDatosPublicos(slug);
    } else {
      this.adminStore.isLoading.set(false);
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'tema-catalogo');
    this.renderer.removeAttribute(this.document.documentElement, 'data-theme');
  }

  private obtenerSlugDesdeSubdominio(): string | null {
    const host = window.location.hostname;

    if (isDominioBase(host)) {
      return null;
    }

    return host.split('.')[0];
  }
}