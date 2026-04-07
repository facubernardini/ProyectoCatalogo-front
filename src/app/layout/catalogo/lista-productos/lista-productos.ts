import { Component, computed, inject, input, signal } from '@angular/core';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { Icon } from "@shared/components/icon";
import { Producto } from 'src/app/core/models/producto.model';
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { CartService } from 'src/app/core/services/cart.service';

type OrdenCriterio = 'menor-precio' | 'mayor-precio' | 'alfa' | 'default';

@Component({
  selector: 'app-lista-productos',
  imports: [Icon],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css',
})
export class ListaProductos {
  productosRaw = input.required<Producto[]>();
  categorias = input.required<CategoriaVendedor[]>();
  
  categoriaSeleccionada = signal<string>('todos');
  ordenSeleccionado = signal<OrdenCriterio>('default');
  mostrarModalFiltros = signal(false);
  productoParaDetalle = signal<Producto | null>(null);

  private cartService = inject(CartService);

  productos = computed(() => {
    // 1. Empezamos filtrando por categoría
    const cat = this.categoriaSeleccionada();
    let listaFiltrada = (cat === 'todos') 
      ? this.productosRaw() 
      : this.productosRaw().filter(p => p.categorias.includes(cat));

    // 2. Aplicamos el ordenamiento sobre el resultado filtrado
    const criterio = this.ordenSeleccionado();
    if (criterio === 'default') return listaFiltrada;

    // Clonamos el array para no mutar el original
    return [...listaFiltrada].sort((a, b) => {
      const precioA = a.presentaciones[0]?.precio ?? 0;
      const precioB = b.presentaciones[0]?.precio ?? 0;

      switch (criterio) {
        case 'menor-precio': return precioA - precioB;
        case 'mayor-precio': return precioB - precioA;
        case 'alfa': return a.nombre.localeCompare(b.nombre);
        default: return 0;
      }
    });
  });

  seleccionarCategoria(nombre: string) {
    this.categoriaSeleccionada.set(nombre);
  }

  abrirFiltros() {
    this.mostrarModalFiltros.set(true);
  }

  cerrarFiltros() {
    this.mostrarModalFiltros.set(false);
  }

  aplicarOrden(criterio: OrdenCriterio) {
    this.ordenSeleccionado.set(criterio);
    this.cerrarFiltros();
  }

  abrirSelector(producto: Producto) {
    if (producto.presentaciones.length === 1) {
      this.agregarAlCarrito(producto, producto.presentaciones[0]);
      return;
    }
    
    this.productoParaDetalle.set(producto);
  }

  agregarAlCarrito(producto: Producto, pres: Presentacion) {
    this.cartService.agregarProducto(producto, pres);
    
    console.log("¡Producto añadido!");
    
    this.productoParaDetalle.set(null);
  }
}