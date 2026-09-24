import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CartService } from '@shared/services/cart.service';
import { CommonModule } from '@angular/common';
import { isDominioBase } from 'src/app/core/data/domains.data';
import { ToastService } from 'src/app/core/services/toast.service';
import { Icon } from 'src/app/shared/components/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProductCardIndumentaria } from '../product-card-indumentaria/product-card-indumentaria';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, Icon, ProductCardIndumentaria],
  templateUrl: './producto-detalle.html',
  animations: [
    trigger('popAnimation', [
      transition(':decrement', [
        style({ transform: 'translateY(10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':increment', [
        style({ transform: 'translateY(-10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ProductoDetalle implements OnInit {
  public adminStore = inject(AdminStoreService);
  public cartService = inject(CartService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  slug = input.required<string>();

  cantidad = signal<number>(1);

  visualizadorAbierto = signal<boolean>(false);
  
  imagenPrincipal = signal<string | null>(null);
  talleSeleccionado = signal<string | null>(null);
  colorSeleccionado = signal<string | null>(null);
  
  touchStartX = 0;

  productoActual = computed(() => {
    const productos = this.adminStore.productos();
    const productSlug = this.slug();
    
    if (productos.length === 0) return null; 
    return productos.find(p => this.crearSlug(p.nombre) === productSlug) || null;
  });

  tallesUnicos = computed(() => {
    const prod = this.productoActual();
    if (!prod) return [];
    return [...new Set(prod.presentaciones.map(p => p.talle).filter((t): t is string => !!t))];
  });

  coloresUnicos = computed(() => {
    const prod = this.productoActual();
    if (!prod) return [];
    const colores = new Map<string, {nombre: string, hex: string}>();
    prod.presentaciones.forEach(p => {
      if (p.color_nombre && p.color_hex && !colores.has(p.color_nombre)) {
        colores.set(p.color_nombre, { nombre: p.color_nombre, hex: p.color_hex });
      }
    });
    return Array.from(colores.values());
  });

  presentacionActiva = computed(() => {
    const prod = this.productoActual();
    if (!prod) return null;
    return prod.presentaciones.find(p => 
      (this.talleSeleccionado() ? p.talle === this.talleSeleccionado() : true) && 
      (this.colorSeleccionado() ? p.color_nombre === this.colorSeleccionado() : true)
    ) || prod.presentaciones[0];
  });

  productosSimilares = computed(() => {
    const prodActual = this.productoActual();
    const todosProductos = this.adminStore.productos();

    if (!prodActual || !prodActual.categorias || prodActual.categorias.length === 0) {
      return { productos: [], categoriaPrincipal: null };
    }

    const categoriaId = prodActual.categorias[0].id;
    const categoriaNombre = prodActual.categorias[0].nombre;

    const relacionados = todosProductos.filter(p => 
      p.id !== prodActual.id && 
      p.categorias?.some(c => c.id === categoriaId)
    );

    return {
      categoriaPrincipal: { id: categoriaId, nombre: categoriaNombre },
      productos: relacionados.slice(0, 4),
      tieneMas: relacionados.length > 4
    };
  });

  indiceImagenActual = computed(() => {
    const prod = this.productoActual();
    if (!prod || !prod.imagenes || prod.imagenes.length === 0) return 1;
    const url = this.imagenPrincipal();
    const index = prod.imagenes.findIndex(img => img.url === url);
    return index !== -1 ? index + 1 : 1;
  });

  constructor() {
    // 2. Efecto para inicializar la imagen, talle y color UNA VEZ que el producto cargó
    effect(() => {
      const prod = this.productoActual();
      if (prod) {
        if (!this.imagenPrincipal()) {
          this.imagenPrincipal.set(prod.imagenes?.length > 0 ? prod.imagenes[0].url : prod.imagen);
        }
        if (!this.talleSeleccionado() && this.tallesUnicos().length > 0) {
          this.talleSeleccionado.set(this.tallesUnicos()[0]);
        }
        if (!this.colorSeleccionado() && this.coloresUnicos().length > 0) {
          this.colorSeleccionado.set(this.coloresUnicos()[0].nombre);
        }
      }
    });

    // 3. Efecto para manejar el error (404) si el producto realmente no existe
    effect(() => {
      const loading = this.adminStore.isLoading();
      const productos = this.adminStore.productos();
      
      if (!loading && productos.length > 0 && !this.productoActual()) {
        this.router.navigate(['/']);
      }
    });

    effect(() => {
      const pres = this.presentacionActiva();
      if (pres) {
        this.cantidad.set(1);
      }
    });
  }

  ngOnInit() {
    // 4. Si entramos por link directo, el store está vacío. Obligamos a cargar los datos de la tienda.
    if (this.adminStore.productos().length === 0 && !this.adminStore.isLoading()) {
      const host = window.location.hostname;
      if (!isDominioBase(host)) {
        const slug = host.split('.')[0];
        this.adminStore.cargarDatosPublicos(slug);
      } else {
        this.router.navigate(['/not-found']);
      }
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent, imagenes: any[]) {
    if (!imagenes || imagenes.length <= 1) return;
    
    const touchEndX = event.changedTouches[0].screenX;
    const umbral = 50;

    if (this.touchStartX - touchEndX > umbral) {
      this.imagenSiguiente(imagenes);
    } else if (touchEndX - this.touchStartX > umbral) {
      this.imagenAnterior(imagenes);
    }
  }

  imagenSiguiente(imagenes: any[]) {
    if (!imagenes || imagenes.length <= 1) return;
    const indexActual = imagenes.findIndex(img => img.url === this.imagenPrincipal());
    const nextIndex = (indexActual + 1) % imagenes.length;
    this.imagenPrincipal.set(imagenes[nextIndex].url);
  }

  imagenAnterior(imagenes: any[]) {
    if (!imagenes || imagenes.length <= 1) return;
    const indexActual = imagenes.findIndex(img => img.url === this.imagenPrincipal());
    const prevIndex = (indexActual - 1 + imagenes.length) % imagenes.length;
    this.imagenPrincipal.set(imagenes[prevIndex].url);
  }

  verMasCategoria() {
    const data = this.productosSimilares();
    if (data.categoriaPrincipal) {
      const slug = this.crearSlug(data.categoriaPrincipal.nombre);
      this.router.navigate(['/', slug]);
    }
  }

  seleccionarColor(colorHex: string, colorNombre: string) {
    this.colorSeleccionado.set(colorNombre);
    const imgAsociada = this.productoActual()?.imagenes.find(img => img.color_asociado === colorNombre);
    if (imgAsociada) this.imagenPrincipal.set(imgAsociada.url);
  }

  permiteVentaSinStock(): boolean {
    return this.adminStore.catalogo()?.permitir_ventas_sin_stock ?? false;
  }

  puedeIncrementar(): boolean {
    const pres = this.presentacionActiva();
    if (!pres) return false;
    
    if (this.permiteVentaSinStock() || pres.stock === null) return true;
    
    // Validamos la cantidad local + lo que ya tenga en el carrito
    const cantidadEnCarrito = this.cartService.getCantidadEnCarrito(pres.id) ?? 0;
    const cantidadTotal = this.cantidad() + cantidadEnCarrito;
    
    return cantidadTotal < pres.stock;
  }

  incrementar() {
    if (this.puedeIncrementar()) {
      this.cantidad.update(c => c + 1);
    }
  }

  decrementar() {
    if (this.cantidad() > 1) {
      this.cantidad.update(c => c - 1);
    }
  }

  agregarAlCarrito() {
    const presentacion = this.presentacionActiva();
    const producto = this.productoActual();
    
    if (presentacion && producto) {
      const permiteVentaSinStock = this.adminStore.catalogo()?.permitir_ventas_sin_stock ?? false;
      if (!permiteVentaSinStock && presentacion.stock !== null && presentacion.stock <= 0) {
        this.toastService.show('Esta variante se encuentra agotada', 'error');
        return;
      }

      const cantidadAAgregar = this.cantidad();

      this.cartService.agregarProducto(producto, presentacion, cantidadAAgregar); 

      this.cartService.open();
      this.cantidad.set(1);
    }
  }

  abrirVisualizador() {
    this.visualizadorAbierto.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarVisualizador() {
    this.visualizadorAbierto.set(false);
    document.body.style.overflow = '';
  }

  scrollThumbnails(element: HTMLElement, distance: number) {
    element.scrollBy({ left: distance, behavior: 'smooth' });
  }

  private crearSlug(texto: string): string {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }
}