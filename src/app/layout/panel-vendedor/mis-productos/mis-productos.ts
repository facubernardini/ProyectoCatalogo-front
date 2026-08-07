import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule, Location } from '@angular/common';
import { Producto } from 'src/app/core/models/producto.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductoManagerService } from 'src/app/core/services/producto-manager.service';
import { FormsModule } from '@angular/forms';
import { ProductFormService } from '@shared/services/product-form.service';
import { ProductPreviewService } from '@shared/services/product-preview.service';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { PdfExportService } from 'src/app/core/services/pdf-export.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { CategoryFormService } from 'src/app/shared/services/category-form.service';

@Component({
  selector: 'app-mis-productos',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './mis-productos.html',
  styleUrl: './mis-productos.css',
})
export class MisProductos {
  private adminStore = inject(AdminStoreService);
  private location = inject(Location);
  private productFormService = inject(ProductFormService);
  private toastService = inject(ToastService);
  private pdfExportService = inject(PdfExportService);
  private categoryFormService = inject(CategoryFormService);
  
  public productManager = inject(ProductoManagerService); 
  public productPreviewService = inject(ProductPreviewService);

  public imageLoaded = signal(false);

  public readonly AVISO_BAJO_STOCK = 3;

  productos = this.adminStore.productos; 
  categorias = this.adminStore.categorias;

  hasCategorias = computed(() => this.categorias().length > 0);
  hasProductos = computed(() => this.productos().length > 0);

  isCategoriaDropdownOpen = signal<boolean>(false);
  isFiltrosOpen = signal<boolean>(false);
  categoriaSeleccionada = signal<string>('todos');
  activeMenuId = signal<number | null>(null);
  isMenuUpward = signal<boolean>(false);
  
  busquedaRaw = signal<string>('');
  filtro = signal<string>('');
  isBuscando = signal<boolean>(false);

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  soloDestacados = signal<boolean>(false);
  soloPausados = signal<boolean>(false);
  soloSinFoto = signal<boolean>(false);
  soloConOfertas = signal<boolean>(false);

  paginaActual = signal(1);
  itemsPorPagina = 20;

  productosFiltrados = computed(() => {
    const seleccion = this.categoriaSeleccionada();
    const term = this.filtro().toLowerCase();
    const destacados = this.soloDestacados();
    const pausados = this.soloPausados();
    const sinFoto = this.soloSinFoto();
    const conOfertas = this.soloConOfertas();
    
    let lista = this.adminStore.productos();

    if (seleccion !== 'todos') {
      lista = lista.filter(prod => prod.categorias?.some(c => c.nombre === seleccion));
    }

    if (term) {
      lista = lista.filter(prod => 
        prod.nombre.toLowerCase().includes(term) || 
        prod.marca?.toLowerCase().includes(term) || 
        prod.descripcion?.toLowerCase().includes(term)
      );
    }

    if (destacados) {
      lista = lista.filter(prod => prod.destacado);
    }

    if (pausados) {
      lista = lista.filter(prod => !prod.activo);
    }

    if (sinFoto) {
      lista = lista.filter(prod => !prod.imagen || prod.imagen.trim() === '');
    }

    if (conOfertas) {
      lista = lista.filter(prod => prod.presentaciones?.some(pres => pres.precio_descuento && pres.precio_descuento > 0));
    }

    return lista;
  });

  productosVisibles = computed(() => {
    const todosLosFiltrados = this.productosFiltrados();
    const limite = this.paginaActual() * this.itemsPorPagina;
    return todosLosFiltrados.slice(0, limite);
  });

  categoriasOrdenadas = computed(() => {
    const lista = this.adminStore.categorias();
    return [...lista].sort((a, b) => Number(b.especial) - Number(a.especial));
  });

  conteosPorCategoria = computed(() => {
    const conteos: Record<string, number> = {};
    
    for (const prod of this.productos()) {
      if (prod.categorias) {
        for (const cat of prod.categorias) {
          conteos[cat.nombre] = (conteos[cat.nombre] || 0) + 1;
        }
      }
    }
    return conteos;
  });

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(valor => {
      this.filtro.set(valor);
      this.isBuscando.set(false);
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  getTotalProductos(): number {
    return this.productos().length;
  }

  getCantidadPorCategoria(categoriaNombre: string): number {
    return this.conteosPorCategoria()[categoriaNombre] || 0;
  }

  getMejorOferta(presentaciones: any[]) {
    if (!presentaciones || presentaciones.length === 0) return null;

    let mejorOferta = null;
    let mayorPorcentaje = 0;

    for (const pres of presentaciones) {
      if (pres.activo !== false && pres.precio_descuento && pres.precio_descuento < pres.precio) {
          
        const porcentajeDescuento = ((pres.precio - pres.precio_descuento) / pres.precio) * 100;

        if (porcentajeDescuento > mayorPorcentaje) {
          mayorPorcentaje = porcentajeDescuento;
          mejorOferta = pres;
        }
      }
    }

    return mejorOferta;
  }

  onImageLoad() {
    this.imageLoaded.set(true);
  }

  toggleDestacados() {
    const activar = !this.soloDestacados();
    
    this.soloDestacados.set(activar);
    this.soloPausados.set(false);
    this.soloSinFoto.set(false);
    this.soloConOfertas.set(false);
    
    this.paginaActual.set(1);
  }

  togglePausados() {
    const activar = !this.soloPausados();
    
    this.soloPausados.set(activar);
    this.soloDestacados.set(false);
    this.soloSinFoto.set(false);
    this.soloConOfertas.set(false);
    
    this.paginaActual.set(1);
  }

  toggleSinFoto() {
    const activar = !this.soloSinFoto();
    
    this.soloSinFoto.set(activar);
    this.soloDestacados.set(false);
    this.soloPausados.set(false);
    this.soloConOfertas.set(false);
    
    this.paginaActual.set(1);
  }

  toggleConOfertas() {
    const activar = !this.soloConOfertas();
    
    this.soloConOfertas.set(activar);
    this.soloDestacados.set(false);
    this.soloPausados.set(false);
    this.soloSinFoto.set(false);
    
    this.paginaActual.set(1);
  }

  onSearchInput(valor: string) {
    this.busquedaRaw.set(valor);
    this.paginaActual.set(1);
    
    if (valor.trim().length > 0) {
      this.isBuscando.set(true);
    } else {
      this.isBuscando.set(false);
    }

    this.searchSubject.next(valor);
  }

  limpiarBusqueda() {
    this.busquedaRaw.set('');
    this.filtro.set('');
    this.isBuscando.set(false);
    this.paginaActual.set(1);
    this.searchSubject.next('');
  }

  limpiarFiltros() {
    this.soloDestacados.set(false);
    this.soloPausados.set(false);
    this.soloSinFoto.set(false);
    this.soloConOfertas.set(false);
    this.isFiltrosOpen.set(false);
    this.paginaActual.set(1);
  }

  toggleFiltrosDropdown() {
    if (!this.hasProductos()) return;
    this.isFiltrosOpen.set(!this.isFiltrosOpen());
    this.isCategoriaDropdownOpen.set(false);
  }

  toggleCategoriaDropdown() {
    if (!this.hasProductos()) return;
    this.isCategoriaDropdownOpen.set(!this.isCategoriaDropdownOpen());
    this.isFiltrosOpen.set(false);
  }

  seleccionarCategoriaCustom(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
    this.isCategoriaDropdownOpen.set(false);
    this.paginaActual.set(1);
  }

  volverAtras() {
    this.location.back();
  }
  
  onAddCategoria() {
    this.categoryFormService.openCreate();
  }

  onAdd() {
    this.productFormService.openCreate();
  }

  onEdit(prod: Producto, event: Event) {
    event.stopPropagation();
    this.productFormService.openEdit(prod);
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    
    if (this.activeMenuId() === id) {
      this.activeMenuId.set(null);
      return;
    }

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    this.isMenuUpward.set(window.innerHeight - rect.bottom < 250);
    this.activeMenuId.set(id);
  }

  @HostListener('document:click')
  closeMenu() {
    this.activeMenuId.set(null);
    this.isMenuUpward.set(false); 
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.activeMenuId() !== null) {
      this.activeMenuId.set(null);
      this.isMenuUpward.set(false);
    }
    this.isCategoriaDropdownOpen.set(false);
    this.isFiltrosOpen.set(false);

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 200;

    if (scrollPosition >= scrollThreshold) {
      this.cargarMas();
    }
  }

  cargarMas() {
    const totalMostrados = this.paginaActual() * this.itemsPorPagina;
    const totalDisponibles = this.productosFiltrados().length;

    if (totalMostrados < totalDisponibles) {
      this.paginaActual.update(p => p + 1);
    }
  }

  async exportarPDF() {
    const categorias = this.categoriasOrdenadas(); 
    const todosLosProductos = this.adminStore.productos();
    const catalogo = this.adminStore.catalogo();

    if (!catalogo) {
      this.toastService.show('Ocurrió un error inesperado', 'error');
      return;
    }

    const proceso = this.toastService.loading('Generando PDF...');

    try {
      await this.pdfExportService.exportarCatalogo(categorias, todosLosProductos, catalogo);
      proceso.success('PDF generado con éxito');
    } catch (error) {
      console.error(error);
      proceso.error('Hubo un error al generar el PDF.');
    }
  }

  onEliminar(producto: Producto) {
    this.productManager.eliminar(producto);
  }
  
  onToggleActivo(producto: Producto) {
    this.productManager.toggleActivo(producto);
  }

  onDestacar(producto: Producto) {
    this.productManager.toggleDestacado(producto);
  }

  onDuplicar(producto: Producto) {
    this.productManager.duplicar(producto);
  }
}