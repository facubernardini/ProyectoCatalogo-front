import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { Producto } from 'src/app/core/models/producto.model';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { ProductosOfertasService } from '@shared/services/productos-ofertas.service';

@Component({
  selector: 'app-productos-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon],
  templateUrl: './productos-ofertas.html'
})
export class ProductosOfertas implements OnDestroy {
  public productosOfertasService = inject(ProductosOfertasService); 
  private adminStore = inject(AdminStoreService);
  private selectorService = inject(ProductSelectorService);

  busquedaRaw = signal<string>('');
  filtro = signal<string>('');
  isBuscando = signal<boolean>(false);

  private searchSubject = new Subject<string>();

  // 🔥 El cambio clave: Filtramos por productos activos que tengan al menos una oferta
  productosConOfertas = computed(() => {
    return this.adminStore.productos().filter(p => 
      p.activo && this.tieneOfertas(p.presentaciones)
    );
  });

  resultados = computed(() => {
    const q = this.filtro().toLowerCase().trim();
    const lista = this.productosConOfertas();

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
    this.productosOfertasService.close();
  }
  
  getPrecioDesde(presentaciones: Presentacion[]): number {
    if (!presentaciones.length) return 0;
    const preciosActuales = presentaciones.map(p => 
      p.precio_descuento !== null ? Number(p.precio_descuento) : Number(p.precio)
    );
    return Math.min(...preciosActuales);
  }

  // Esta misma función que ya tenías nos sirve como filtro maestro arriba
  tieneOfertas(presentaciones: Presentacion[]): boolean {
    return presentaciones.some(p => p.precio_descuento !== null);
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  abrirProducto(producto: Producto) {
    this.selectorService.open(producto);
  }
}