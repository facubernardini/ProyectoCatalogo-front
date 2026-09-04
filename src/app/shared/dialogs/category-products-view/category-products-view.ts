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
import { ProductCard } from "src/app/layout/catalogo/lista-productos/product-card/product-card";

@Component({
  selector: 'app-category-products-view',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, ProductCard],
  templateUrl: './category-products-view.html'
})
export class CategoryProductsView implements OnDestroy {
  public viewService = inject(CategoryViewService);
  public menuService = inject(MenuLateralService);
  private adminStore = inject(AdminStoreService);
  private selectorService = inject(ProductSelectorService);

  busquedaRaw = signal<string>('');
  filtro = signal<string>('');
  isBuscando = signal<boolean>(false);

  private searchSubject = new Subject<string>();

  productosDeCategoria = computed(() => {
    const catSeleccionada = this.viewService.categoria();
    if (!catSeleccionada) return [];
    
    return this.adminStore.productos().filter(p => 
      p.categorias?.some(c => c.nombre === catSeleccionada) && p.activo
    );
  });

  resultados = computed(() => {
    const termOriginal = this.filtro().trim();
    const listaBase = this.productosDeCategoria();

    // Si no hay búsqueda o es muy corta, devolvemos la lista de la categoría tal cual
    if (termOriginal.length < 2) {
      return listaBase; 
    }

    const queryLimpia = termOriginal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const terminosBusqueda = queryLimpia.split(' ').filter(t => t.length > 0);
    const queryCompacta = queryLimpia.replace(/\s+/g, "");

    if (terminosBusqueda.length > 0) {
      const primerTermino = terminosBusqueda[0];

      // A. Filtrado base dual (solo nombre y marca)
      const filtrados = listaBase.filter(p => {
        const camposUnidos = [p.nombre, p.marca].filter(Boolean).join(' ');
        const textoProducto = camposUnidos.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const textoProductoCompacto = textoProducto.replace(/\s+/g, "");

        const matchClasico = terminosBusqueda.every(termino => textoProducto.includes(termino));
        const matchCompacto = textoProductoCompacto.includes(queryCompacta);

        return matchClasico || matchCompacto;
      });

      // B. Sistema de Puntaje (Scoring) y ordenamiento
      return filtrados.map(p => {
        const nombre = (p.nombre || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const marca = (p.marca || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const nombreCompacto = nombre.replace(/\s+/g, "");
        const marcaCompacta = marca.replace(/\s+/g, "");

        let score = 0;

        if (nombre === queryLimpia) {
          score = 100;
        } 
        else if (nombre.startsWith(queryLimpia)) {
          score = 90;
        }
        else if (nombre.includes(queryLimpia)) {
          score = 80;
        }
        else if (nombre.startsWith(primerTermino) && terminosBusqueda.every(t => nombre.includes(t))) {
          score = 70;
        }
        else if (terminosBusqueda.every(t => nombre.includes(t))) {
          score = 60;
        } 
        else if (nombreCompacto.includes(queryCompacta)) {
          score = 55;
        }
        else if (marcaCompacta.includes(queryCompacta)) {
          score = 50; 
        }
        else if (terminosBusqueda.some(t => marca.includes(t))) {
          score = 40;
        } 
        else {
          score = 10;
        }

        return { producto: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.producto);
    }

    return listaBase;
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

  abrirProducto(producto: Producto, fromModal: boolean = false) {
    this.selectorService.open(producto, fromModal);
  }
}