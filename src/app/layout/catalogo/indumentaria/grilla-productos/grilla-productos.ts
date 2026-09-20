import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { ProductCardIndumentaria } from '../product-card-indumentaria/product-card-indumentaria';

export type TipoOrden = 'nuevo' | 'viejo' | 'precio_alto' | 'precio_bajo' | 'az' | 'za';
interface ColorData {
  nombre: string;
  hex: string;
}

@Component({
  selector: 'app-grilla-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardIndumentaria, Icon],
  templateUrl: './grilla-productos.html',
})
export class GrillaProductos {
  titulo = input.required<string>();
  productos = input.required<Producto[]>();

  isFiltrosOpen = signal(false);
  isOrdenDesplegado = signal(false); 

  tempOrdenActual = signal<TipoOrden>('nuevo');
  tempMarcas = signal<Set<string>>(new Set());
  tempTalles = signal<Set<string>>(new Set());
  tempColores = signal<Set<string>>(new Set());
  tempPrecioMin = signal<number | null>(null);
  tempPrecioMax = signal<number | null>(null);

  ordenActual = signal<TipoOrden>('nuevo');
  marcasSeleccionadas = signal<Set<string>>(new Set());
  tallesSeleccionados = signal<Set<string>>(new Set());
  coloresSeleccionados = signal<Set<string>>(new Set());
  precioMin = signal<number | null>(null);
  precioMax = signal<number | null>(null);

  marcasDisponibles = computed(() => {
    const marcas = this.productos()
      .map(p => p.marca)
      .filter((m): m is string => !!m && m.trim() !== '');
    return [...new Set(marcas)].sort((a, b) => a.localeCompare(b));
  });

  tallesDisponibles = computed(() => {
    const talles = new Set<string>();
    this.productos().forEach(p => p.presentaciones?.forEach(pres => {
        if (pres.talle) talles.add(pres.talle);
    }));
    return Array.from(talles).sort(); 
  });

  coloresDisponibles = computed(() => {
    const coloresMap = new Map<string, ColorData>();
    this.productos().forEach(p => p.presentaciones?.forEach(pres => {
        if (pres.color_nombre && pres.color_hex && !coloresMap.has(pres.color_nombre)) {
          coloresMap.set(pres.color_nombre, { nombre: pres.color_nombre, hex: pres.color_hex });
        }
    }));
    return Array.from(coloresMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  productosFiltradosYOrdenados = computed(() => {
    let prods = [...this.productos()];

    const marcasActivas = this.marcasSeleccionadas();
    if (marcasActivas.size > 0) {
      prods = prods.filter(p => p.marca && marcasActivas.has(p.marca));
    }

    const tallesActivos = this.tallesSeleccionados();
    if (tallesActivos.size > 0) {
      prods = prods.filter(p => p.presentaciones?.some(pres => pres.talle && tallesActivos.has(pres.talle)));
    }

    const coloresActivos = this.coloresSeleccionados();
    if (coloresActivos.size > 0) {
      prods = prods.filter(p => p.presentaciones?.some(pres => pres.color_nombre && coloresActivos.has(pres.color_nombre)));
    }

    const pMin = this.precioMin();
    const pMax = this.precioMax();
    if (pMin !== null || pMax !== null) {
      prods = prods.filter(p => {
        const precioProducto = this.getMejorPrecio(p);
        if (pMin !== null && precioProducto < pMin) return false;
        if (pMax !== null && precioProducto > pMax) return false;
        return true;
      });
    }

    const orden = this.ordenActual();
    return prods.sort((a, b) => {
      switch (orden) {
        case 'nuevo': return b.id - a.id; 
        case 'viejo': return a.id - b.id;
        case 'precio_alto': return this.getMejorPrecio(b) - this.getMejorPrecio(a);
        case 'precio_bajo': return this.getMejorPrecio(a) - this.getMejorPrecio(b);
        case 'az': return a.nombre.localeCompare(b.nombre);
        case 'za': return b.nombre.localeCompare(a.nombre);
        default: return 0;
      }
    });
  });

  toggleFiltros() {
    this.isFiltrosOpen.update(v => !v);
    
    if (this.isFiltrosOpen()) {
      document.body.style.overflow = 'hidden';
      this.tempOrdenActual.set(this.ordenActual());
      this.tempMarcas.set(new Set(this.marcasSeleccionadas()));
      this.tempTalles.set(new Set(this.tallesSeleccionados()));
      this.tempColores.set(new Set(this.coloresSeleccionados()));
      this.tempPrecioMin.set(this.precioMin());
      this.tempPrecioMax.set(this.precioMax());
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleAcordeonOrden() {
    this.isOrdenDesplegado.update(v => !v);
  }

  cambiarOrden(nuevoOrden: TipoOrden) {
    this.tempOrdenActual.set(nuevoOrden);
  }

  toggleMarca(marca: string) {
    this.tempMarcas.update(set => {
      const nuevoSet = new Set(set);
      nuevoSet.has(marca) ? nuevoSet.delete(marca) : nuevoSet.add(marca);
      return nuevoSet;
    });
  }

  toggleTalle(talle: string) {
    this.tempTalles.update(set => {
      const nuevoSet = new Set(set);
      nuevoSet.has(talle) ? nuevoSet.delete(talle) : nuevoSet.add(talle);
      return nuevoSet;
    });
  }

  toggleColor(colorNombre: string) {
    this.tempColores.update(set => {
      const nuevoSet = new Set(set);
      nuevoSet.has(colorNombre) ? nuevoSet.delete(colorNombre) : nuevoSet.add(colorNombre);
      return nuevoSet;
    });
  }

  actualizarPrecio(tipo: 'min' | 'max', evento: Event) {
    const valor = (evento.target as HTMLInputElement).value;
    const num = valor === '' ? null : Number(valor);
    tipo === 'min' ? this.tempPrecioMin.set(num) : this.tempPrecioMax.set(num);
  }

  limpiarFiltrosTemporales() {
    this.tempMarcas.set(new Set());
    this.tempTalles.set(new Set());
    this.tempColores.set(new Set());
    this.tempPrecioMin.set(null);
    this.tempPrecioMax.set(null);
    this.tempOrdenActual.set('nuevo');
  }

  aplicarFiltros() {
    this.ordenActual.set(this.tempOrdenActual());
    this.marcasSeleccionadas.set(new Set(this.tempMarcas()));
    this.tallesSeleccionados.set(new Set(this.tempTalles()));
    this.coloresSeleccionados.set(new Set(this.tempColores()));
    this.precioMin.set(this.tempPrecioMin());
    this.precioMax.set(this.tempPrecioMax());
    
    this.toggleFiltros();
  }

  private getMejorPrecio(producto: Producto): number {
    if (!producto.presentaciones || producto.presentaciones.length === 0) return 0;
    const mejorPres = producto.presentaciones.reduce((min, p) => {
        const precioMin = min.precio_descuento ?? min.precio;
        const precioP = p.precio_descuento ?? p.precio;
        return Number(precioP) < Number(precioMin) ? p : min;
    });
    return Number(mejorPres.precio_descuento ?? mejorPres.precio);
  }
}