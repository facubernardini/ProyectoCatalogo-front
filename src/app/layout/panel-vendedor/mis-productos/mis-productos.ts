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

  productosFiltrados = computed(() => {
    const seleccion = this.categoriaSeleccionada();
    const term = this.filtro().toLowerCase();
    const destacados = this.soloDestacados();
    const pausados = this.soloPausados();
    
    let lista = this.adminStore.productos();

    if (seleccion !== 'todos') {
      lista = lista.filter(prod => prod.categorias?.some(c => c.nombre === seleccion));
    }

    if (term) {
      lista = lista.filter(prod => prod.nombre.toLowerCase().includes(term));
    }

    if (destacados) {
      lista = lista.filter(prod => prod.destacado);
    }

    if (pausados) {
      lista = lista.filter(prod => !prod.activo);
    }

    return lista;
  });

  categoriasOrdenadas = computed(() => {
    const lista = this.adminStore.categorias();
    return [...lista].sort((a, b) => Number(b.especial) - Number(a.especial));
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

  onImageLoad() {
    this.imageLoaded.set(true);
  }

  toggleDestacados() {
    this.soloDestacados.update(v => !v);
  }

  togglePausados() {
    this.soloPausados.update(v => !v);
  }

  onSearchInput(valor: string) {
    this.busquedaRaw.set(valor);
    
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
    this.searchSubject.next('');
  }

  limpiarFiltros() {
    this.soloDestacados.set(false);
    this.soloPausados.set(false);
    this.isFiltrosOpen.set(false);
  }

  toggleFiltrosDropdown() {
    if (!this.hasProductos()) return;
    this.isFiltrosOpen.set(!this.isFiltrosOpen());
    // Cerramos el otro menú por las dudas para que no se superpongan
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

  // --- MÉTODOS DELEGADOS AL MANAGER ---
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