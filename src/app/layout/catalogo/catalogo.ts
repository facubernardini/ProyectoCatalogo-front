import { AfterViewInit, Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
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
import { CartService } from 'src/app/core/services/cart.service';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, Navbar, CarrouselDestacados, ListaProductos, Icon, SwipeDownDirective],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoPublico implements AfterViewInit{
  @ViewChild('sentinel') sentinel!: ElementRef;

  isStuck = signal(false);

  metodoEntrega = signal<'envio' | 'retiro'>('retiro');
  
  private route = inject(ActivatedRoute);

  private productoService = inject(ProductoService);
  private catalogoService = inject(CatalogoService);
  private categoriaService = inject(CategoriaService);
  public cartService = inject(CartService);
  
  catalogo = signal<Catalogo | null>(null);
  productos = signal<Producto[]>([]);
  categorias = signal<CategoriaVendedor[]>([]);

  totalEnCarro = this.cartService.totalItems;

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

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        this.isStuck.set(!entry.isIntersecting);
      },
      {
        threshold: [0],
        rootMargin: '0px'
      }
    );

    observer.observe(this.sentinel.nativeElement);
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

  montoFaltante = computed(() => {
    const minimo = Number(this.catalogo()?.minimo_compra ?? 0);
    const total = this.cartService.totalPrice();
    return Math.max(0, minimo - total);
  });

  puedeFinalizar = computed(() => {
    const tieneItems = this.cartService.totalItems() > 0;
    const cumpleMinimo = this.cartService.totalPrice() >= (this.catalogo()?.minimo_compra ?? 0);
    const tienePago = this.cartService.selectedPaymentMethod() !== null; // <--- NUEVA REGLA
    
    return tieneItems && cumpleMinimo && tienePago;
  });

  totalFinal = computed(() => {
    const subtotal = this.cartService.totalPrice();
    const costoEnvio = Number(this.catalogo()?.costo_envio ?? 0);
    
    return this.metodoEntrega() === 'envio' 
      ? subtotal + costoEnvio 
      : subtotal;
  });

  finalizarPedido() {
    const items = this.cartService.items();
    const envio = this.metodoEntrega() === 'envio';
    const costoEnvio = this.catalogo()?.costo_envio ?? 0;
    const pago = this.cartService.selectedPaymentMethod()?.nombre;
    
    let mensaje = `*Nuevo Pedido - ${this.catalogo()?.nombre_tienda}*\n\n`;
    
    items.forEach(item => {
      mensaje += `• ${item.cantidad}x ${item.nombre} (${item.unidad}): $${item.precio * item.cantidad}\n`;
    });

    mensaje += `\n--------------------------`;
    mensaje += `\n*Subtotal:* $${this.cartService.totalPrice()}`;
    mensaje += `\n*Medio de Pago:* ${pago}`;
    
    if (envio) {
      mensaje += `\n*Envío:* $${costoEnvio}`;
      mensaje += `\n*Entrega:* Envío a domicilio`;
    } else {
      mensaje += `\n*Entrega:* Retiro en el local`;
    }

    mensaje += `\n*TOTAL FINAL: $${this.totalFinal()}*`;
    
    const phone = this.catalogo()?.wpp_numero;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
  }

}