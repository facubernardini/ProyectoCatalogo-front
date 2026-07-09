import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { Producto } from 'src/app/core/models/producto.model';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ProductosDestacadosService } from '@shared/services/productos-destacados.service';
import { ProductCard } from "src/app/layout/catalogo/lista-productos/product-card/product-card";

@Component({
  selector: 'app-productos-destacados',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, ProductCard],
  templateUrl: './productos-destacados.html'
})
export class ProductosDestacados implements OnDestroy {
  public productosDestacadosService = inject(ProductosDestacadosService); 
  private adminStore = inject(AdminStoreService);
  private selectorService = inject(ProductSelectorService);

  busquedaRaw = signal<string>('');
  filtro = signal<string>('');
  isBuscando = signal<boolean>(false);

  private searchSubject = new Subject<string>();

  productosDestacados = computed(() => {
    return this.adminStore.productos().filter(p => p.destacado && p.activo);
  });

  resultados = computed(() => {
    const q = this.filtro().toLowerCase().trim();
    const lista = this.productosDestacados();

    if (q.length < 2) {
      return lista; 
    }

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

  cerrarVista() {
    this.limpiarBusqueda();
    this.productosDestacadosService.close();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  abrirProducto(producto: Producto) {
    this.selectorService.open(producto);
  }
}