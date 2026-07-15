import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from "@shared/components/icon";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { CategoryDeleteService } from '@shared/services/category-delete.service';
import { CategoryFormService } from '@shared/services/category-form.service';
import { CategoryPreviewService } from '@shared/services/category-preview.service';
import { CategoriaManagerService } from 'src/app/core/services/categoria-manager.service';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { MicroLoadingService } from 'src/app/core/services/micro-loading.service';

@Component({
  selector: 'app-mis-categorias',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './mis-categorias.html',
  styleUrl: './mis-categorias.css',
})
export class MisCategorias {
  private adminStore = inject(AdminStoreService);
  private categoryFormService = inject(CategoryFormService);
  private categoryDeleteService = inject(CategoryDeleteService);
  private location = inject(Location);
  private confirmService = inject(ConfirmService);
  private microLoading = inject(MicroLoadingService);

  public categoriaManager = inject(CategoriaManagerService);
  public categoryPreview = inject(CategoryPreviewService);

  hasCategorias = computed(() => this.adminStore.categorias().length > 0);

  busquedaRaw = signal('');
  filtro = signal('');
  isBuscando = signal(false);

  activeMenuId = signal<number | null>(null);
  isMenuUpward = signal<boolean>(false);

  isFiltrosOpen = signal<boolean>(false);
  soloDestacadas = signal<boolean>(false);
  soloPausadas = signal<boolean>(false);

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  
  categoriasFiltradas = computed(() => {
    const term = this.filtro().toLowerCase();
    const destacadas = this.soloDestacadas();
    const pausadas = this.soloPausadas();
    
    let lista = this.adminStore.categorias();

    if (term) {
      lista = lista.filter(c => c.nombre.toLowerCase().includes(term));
    }

    if (destacadas) {
      lista = lista.filter(c => c.especial);
    }

    if (pausadas) {
      lista = lista.filter(c => !c.activo);
    }

    return lista;
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

  onSearchInput(valor: string) {
    this.busquedaRaw.set(valor);
    
    if (valor.trim().length > 0) {
      this.isBuscando.set(true);
    } else {
      this.isBuscando.set(false);
    }

    this.searchSubject.next(valor);
  }

  toggleFiltrosDropdown() {
    if (!this.hasCategorias()) return;
    this.isFiltrosOpen.set(!this.isFiltrosOpen());
  }

  toggleDestacados() {
    this.soloDestacadas.update(v => !v);
  }

  togglePausados() {
    this.soloPausadas.update(v => !v);
  }

  limpiarBusqueda() {
    this.busquedaRaw.set('');
    this.filtro.set('');
    this.isBuscando.set(false);
    this.searchSubject.next('');
  }

  limpiarFiltros() {
    this.soloDestacadas.set(false);
    this.soloPausadas.set(false);
    this.isFiltrosOpen.set(false);
  }

  onAddCategory() {
    this.categoryFormService.openCreate();
  }

  onEditCategory(categoria: CategoriaVendedor) {
    this.categoryFormService.openEdit(categoria);
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();

    if (this.activeMenuId() !== id) {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      
      this.isMenuUpward.set(window.innerHeight - rect.bottom < 250);
    }

    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
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
    this.isFiltrosOpen.set(false);
  }

  volverAtras() {
    this.location.back();
  }

  onToggleEspecial(categoria: CategoriaVendedor) {
    this.categoriaManager.toggleEspecial(categoria);
  }

  onToggleActiva(categoria: CategoriaVendedor) {
    this.categoriaManager.toggleActivo(categoria);
  }

  async onEliminar(categoria: CategoriaVendedor) {
    const productosAfectados = this.adminStore.productos().filter(p => 
      p.categorias?.length === 1 && p.categorias[0].id === categoria.id
    );

    if (productosAfectados.length === 0) {
      const confirm = await this.confirmService.ask({
        title: '¿Eliminar categoría?',
        message: `¿Estás seguro de eliminar "${categoria.nombre}"?`,
        icon: 'trash',
        type: 'danger'
      });

      if (!confirm) return;

      this.microLoading.show('Eliminando...');
      this.categoriaManager.eliminar(categoria.id, 'eliminar');
    }
    else{
      const resultado = await this.categoryDeleteService.ask({
        categoria,
        productosAfectados: productosAfectados
      });

      if (!resultado) return;

      this.microLoading.show('Eliminando...');
      this.categoriaManager.eliminar(categoria.id, resultado.accion, resultado.categoriaDestinoId);
    }
  }
}