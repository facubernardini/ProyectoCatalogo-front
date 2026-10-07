import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { ProductCardIndumentaria } from '../product-card-indumentaria/product-card-indumentaria';

interface GrupoProductos {
  id_grupo: string | number;
  nombre: string;
  ruta: string;
  productos: any[];
  tieneMas: boolean;
  totalProductos: number;
}

@Component({
  selector: 'app-productos-indumentaria',
  standalone: true,
  imports: [ProductCardIndumentaria, Icon],
  templateUrl: './productos-indumentaria.html',
})
export class ProductosIndumentaria {
  public adminStore = inject(AdminStoreService);
  private router = inject(Router);

  categoriasConProductos = computed<GrupoProductos[]>(() => {
    const categorias = this.adminStore.categorias();
    const todosProductos = this.adminStore.productos();
    const permiteVentaSinStock = this.adminStore.catalogo()?.permitir_ventas_sin_stock ?? false;

    const grupos: GrupoProductos[] = [];

    // --- 1. GRUPO DESTACADOS ---
    let prodsDestacados = todosProductos.filter(p => p.destacado);
    prodsDestacados = this.ordenarPorDisponibilidad(prodsDestacados, permiteVentaSinStock); // Ordenamos

    if (prodsDestacados.length > 0) {
      grupos.push({
        id_grupo: 'destacados',
        nombre: 'Destacados',
        ruta: 'destacados',
        productos: prodsDestacados.slice(0, 20),
        tieneMas: prodsDestacados.length > 20,
        totalProductos: prodsDestacados.length
      });
    }

    // --- 2. GRUPO OFERTAS ---
    let prodsOfertas = todosProductos.filter(p => {
      if (p.presentaciones && p.presentaciones.length > 0) {
        return p.presentaciones[0].precio_descuento && p.presentaciones[0].precio_descuento > 0;
      }
      return false;
    });
    prodsOfertas = this.ordenarPorDisponibilidad(prodsOfertas, permiteVentaSinStock); // Ordenamos

    if (prodsOfertas.length > 0) {
      grupos.push({
        id_grupo: 'ofertas',
        nombre: 'Ofertas Especiales',
        ruta: 'ofertas',
        productos: prodsOfertas.slice(0, 20),
        tieneMas: prodsOfertas.length > 20,
        totalProductos: prodsOfertas.length
      });
    }

    const mapearCategoria = (cat: any) => {
      let prodsDeCategoria = todosProductos.filter(p => 
        p.categorias?.some((c: any) => c.id === cat.id)
      );
      
      prodsDeCategoria = this.ordenarPorDisponibilidad(prodsDeCategoria, permiteVentaSinStock);

      return {
        id_grupo: cat.id,
        nombre: cat.nombre,
        ruta: this.crearSlug(cat.nombre),
        productos: prodsDeCategoria.slice(0, 20), 
        tieneMas: prodsDeCategoria.length > 20,
        totalProductos: prodsDeCategoria.length
      };
    };

    // --- 3. CATEGORÍAS DESTACADAS
    const gruposCategoriasDestacadas = categorias
      .filter(cat => cat.especial)
      .map(mapearCategoria)
      .filter(grupo => grupo.productos.length > 0);

    // --- 4. CATEGORÍAS NORMALES
    const gruposCategoriasNormales = categorias
      .filter(cat => !cat.especial)
      .map(mapearCategoria)
      .filter(grupo => grupo.productos.length > 0);

    return [
      ...grupos, 
      ...gruposCategoriasDestacadas, 
      ...gruposCategoriasNormales
    ];
  });

  verMas(rutaDestino: string) {
    this.router.navigate(['/', rutaDestino]);
  }

  scrollCarousel(carousel: HTMLElement, direccion: number) {
    const scrollAmount = 600; 
    carousel.scrollBy({ left: scrollAmount * direccion, behavior: 'smooth' });
  }

  private crearSlug(texto: string): string {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private ordenarPorDisponibilidad(productos: any[], permiteVentaSinStock: boolean): any[] {
    return [...productos].sort((a, b) => {
      const aDisponible = this.productoEstaDisponible(a, permiteVentaSinStock);
      const bDisponible = this.productoEstaDisponible(b, permiteVentaSinStock);

      if (aDisponible === bDisponible) return 0;
      
      return aDisponible ? -1 : 1;
    });
  }

  private productoEstaDisponible(producto: any, permiteVentaSinStock: boolean): boolean {
    if (!producto.presentaciones || producto.presentaciones.length === 0) return false;
    
    return producto.presentaciones.some((p: any) => {
      const estaActiva = p.activo !== false;
      const tieneStock = permiteVentaSinStock || (p.stock === null || p.stock > 0);
      return estaActiva && tieneStock;
    });
  }
}