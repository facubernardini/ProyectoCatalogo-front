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
import { ActivatedRoute, Router } from '@angular/router';
import { isDominioBase } from 'src/app/core/data/domains.data';
import { ImageViewer } from "src/app/shared/dialogs/image-viewer/image-viewer";
import { Indumentaria } from './indumentaria/indumentaria';
import { HeroIndumentaria } from './indumentaria/hero-indumentaria/hero-indumentaria';
import { ProductosIndumentaria } from './indumentaria/productos-indumentaria/productos-indumentaria';
import { ProductoDetalle } from './indumentaria/producto-detalle/producto-detalle';
import { Producto } from 'src/app/core/models/producto.model';
import { GrillaProductos } from './indumentaria/grilla-productos/grilla-productos';
import { combineLatest } from 'rxjs';

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
    ImageViewer,
    Indumentaria,
    HeroIndumentaria,
    ProductosIndumentaria,
    ProductoDetalle,
    GrillaProductos
],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoPublico implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  public adminStore = inject(AdminStoreService);
  public exploradorProductosService = inject(ExploradorProductosService);
  public cartService = inject(CartService);

  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  isDesktop = signal(window.innerWidth >= 768);

  // Indumentaria
  vistaActual = signal<'home' | 'detalle' | 'grilla'>('home');
  productoSlugActivo = signal<string | null>(null);
  tituloGrilla = signal<string>('');
  productosFiltrados = signal<Producto[]>([]);

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

    effect(() => {
      this.vistaActual(); 
      
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    });

    effect(() => {
      const productos = this.adminStore.productos();
      const categorias = this.adminStore.categorias();
      const segmentos = this.route.snapshot.url;
      const query = this.route.snapshot.queryParamMap.get('q');
      const vista = this.vistaActual();
      
      if (productos.length === 0 || vista !== 'grilla') return;

      // Escenario A: Búsqueda (ej: /buscar?q=remera)
      if (segmentos.length > 0 && segmentos[0].path === 'buscar' && query) {
        this.tituloGrilla.set(`Resultados para: "${query}"`);
        const queryLimpia = query.toLowerCase();
        
        const filtrados = productos.filter(p => 
          p.nombre.toLowerCase().includes(queryLimpia) || 
          p.marca?.toLowerCase().includes(queryLimpia)
        );
        this.productosFiltrados.set(filtrados);
      } 
      
      // Escenario B: Categoría (ej: /categoria/remeras)
      else if (segmentos.length >= 2 && segmentos[0].path === 'categoria') {
        const catSlug = segmentos[1].path;
        
        // Buscamos la categoría para obtener su nombre real
        const catEncontrada = categorias.find(c => this.crearSlug(c.nombre) === catSlug);
        this.tituloGrilla.set(catEncontrada ? `${catEncontrada.nombre}` : 'Categoría');
        
        const filtrados = productos.filter(p => 
          p.categorias?.some(c => this.crearSlug(c.nombre) === catSlug)
        );
        this.productosFiltrados.set(filtrados);
      }
    }, { allowSignalWrites: true });
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

    combineLatest([this.route.url, this.route.queryParams]).subscribe(([segments, queryParams]) => {
      if (segments.length === 0) {
        this.vistaActual.set('home');
      } 
      else if (segments.length >= 3 && segments[0].path === 'productos') {
        this.vistaActual.set('detalle');
        this.productoSlugActivo.set(segments[2].path);
      } 
      else if (segments[0].path === 'categoria' || segments[0].path === 'buscar') {
        this.vistaActual.set('grilla');
      } 
      else {
        this.vistaActual.set('home');
      }
    });
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

  public crearSlug(texto: string): string {
    if (!texto) return '';

    return texto
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}