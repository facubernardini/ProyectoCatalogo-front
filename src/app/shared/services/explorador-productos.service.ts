import { Injectable, signal, computed, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

type VistaCatalogo = 'home' | 'busqueda' | 'categoria' | 'destacados' | 'ofertas';

@Injectable({ providedIn: 'root' })
export class ExploradorProductosService {
  private adminStore = inject(AdminStoreService);

  vistaActual = signal<VistaCatalogo>('home');
  terminoBusqueda = signal<string>('');
  categoriaSeleccionada = signal<string>('');

  productosFiltrados = computed(() => {
    const todosLosProductos = this.adminStore.productos();
    const vista = this.vistaActual();

    if (vista === 'home') {
      return [];
    }

    if (vista === 'busqueda') {
      const termino = this.terminoBusqueda().toLowerCase();
      return todosLosProductos.filter(p => 
        p.nombre.toLowerCase().includes(termino) || 
        p.descripcion!.toLowerCase().includes(termino)
      );
    }

    if (vista === 'categoria') {
      const categoria = this.categoriaSeleccionada();
      return todosLosProductos.filter(p => 
        p.categorias.some(c => c.nombre === categoria)
      );
    }

    if (vista === 'destacados') {
      return todosLosProductos.filter(p => p.destacado);
    }

    if (vista === 'ofertas') {
      return todosLosProductos.filter(p => 
        p.presentaciones.some(pres => pres.precio_descuento && pres.precio_descuento > 0)
      );
    }

    return [];
  });

  buscar(termino: string) {
    if (!termino.trim()) {
      this.limpiarVista();
      return;
    }
    this.terminoBusqueda.set(termino);
    this.vistaActual.set('busqueda');
  }

  verCategoria(categoria: string) {
    this.categoriaSeleccionada.set(categoria);
    this.vistaActual.set('categoria');
  }

  verDestacados() {
    this.terminoBusqueda.set('');
    this.categoriaSeleccionada.set(''); 
    this.vistaActual.set('destacados');
  }

  verTodasLasOfertas() {
    this.terminoBusqueda.set('');
    this.categoriaSeleccionada.set(''); 
    this.vistaActual.set('ofertas');
  }

  limpiarVista() {
    this.terminoBusqueda.set('');
    this.categoriaSeleccionada.set('');
    this.vistaActual.set('home');
  }
}