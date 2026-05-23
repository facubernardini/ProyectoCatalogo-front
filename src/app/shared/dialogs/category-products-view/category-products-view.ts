import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { Producto } from 'src/app/core/models/producto.model';
import { CategoryViewService } from '@shared/services/category-view.service';
import { MenuLateralService } from '@shared/services/menu-lateral.service';
import { ProductSelectorService } from '@shared/services/product-selector.service';

@Component({
  selector: 'app-category-products-view',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon],
  templateUrl: './category-products-view.html'
})
export class CategoryProductsView implements OnDestroy {
  public viewService = inject(CategoryViewService);
  public menuService = inject(MenuLateralService);
  private adminStore = inject(AdminStoreService);
  private selectorService = inject(ProductSelectorService);

  // 1. Estados de la UI (Gemelos del buscador general)
  busquedaRaw = signal<string>('');
  filtro = signal<string>('');
  isBuscando = signal<boolean>(false);

  // 2. Motor de tiempo RxJS
  private searchSubject = new Subject<string>();

  // 3. Pre-filtramos los productos que pertenecen a esta categoría
  productosDeCategoria = computed(() => {
    const catSeleccionada = this.viewService.categoria();
    if (!catSeleccionada) return [];
    
    return this.adminStore.productos().filter(p => 
      p.categorias?.some(c => c.nombre === catSeleccionada) && p.activo
    );
  });

  // 4. Aplicamos el filtro de texto sobre los productos de la categoría
  resultados = computed(() => {
    const q = this.filtro().toLowerCase().trim();
    
    // 1. Agarramos todos los productos de esta categoría
    const lista = this.productosDeCategoria();

    // 2. 
    // Si no hay texto (o hay 1 sola letra), retornamos la lista COMPLETA, no un array vacío.
    if (q.length < 2) {
      return lista; 
    }

    // 3. Si hay texto, filtramos esa lista
    return lista.filter(p => 
      p.nombre.toLowerCase().includes(q) || 
      (p.descripcion && p.descripcion.toLowerCase().includes(q))
    );
  });

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(termino => {
      if (!termino || termino.trim().length < 2) {
        this.filtro.set('');
      } else {
        this.filtro.set(termino);
      }
      this.isBuscando.set(false);
    });
  }

  onSearchChange(termino: string) {
    this.busquedaRaw.set(termino);

    if (!termino || termino.trim().length < 2) {
      this.filtro.set('');
      this.isBuscando.set(false);
    } else {
      this.isBuscando.set(true);
    }

    this.searchSubject.next(termino); 
  }

  limpiarBusqueda() {
    this.busquedaRaw.set('');
    this.filtro.set('');
    this.isBuscando.set(false);
    this.searchSubject.next('');
  }

  volverAlMenu() {
    this.limpiarBusqueda();
    this.viewService.close();
    this.menuService.open();
  }
  
  getPrecioDesde(presentaciones: Presentacion[]): number {
    if (!presentaciones.length) return 0;
    const preciosActuales = presentaciones.map(p => 
      p.precio_descuento !== null ? Number(p.precio_descuento) : Number(p.precio)
    );
    return Math.min(...preciosActuales);
  }

  tieneOfertas(presentaciones: Presentacion[]): boolean {
    return presentaciones.some(p => p.precio_descuento !== null);
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  abrirProducto(producto: Producto) {
    this.viewService.close();
    this.selectorService.open(producto);
  }
}