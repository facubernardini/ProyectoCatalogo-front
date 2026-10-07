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

    const grupos: GrupoProductos[] = [];

    // --- 1. GRUPO DESTACADOS ---
    const prodsDestacados = todosProductos.filter(p => p.destacado);
    if (prodsDestacados.length > 0) {
      grupos.push({
        id_grupo: 'destacados',
        nombre: 'Destacados',
        ruta: 'destacados',
        productos: prodsDestacados.slice(0, 10),
        tieneMas: prodsDestacados.length > 10,
        totalProductos: prodsDestacados.length
      });
    }

    // --- 2. GRUPO OFERTAS ---
    const prodsOfertas = todosProductos.filter(p => {
      if (p.presentaciones && p.presentaciones.length > 0) {
        return p.presentaciones[0].precio_descuento && p.presentaciones[0].precio_descuento > 0;
      }
      return false;
    });

    if (prodsOfertas.length > 0) {
      grupos.push({
        id_grupo: 'ofertas',
        nombre: 'Ofertas Especiales',
        ruta: 'ofertas',
        productos: prodsOfertas.slice(0, 10),
        tieneMas: prodsOfertas.length > 10,
        totalProductos: prodsOfertas.length
      });
    }

    // --- FUNCIÓN HELPER PARA MAPEAR CATEGORÍAS ---
    const mapearCategoria = (cat: any) => {
      const prodsDeCategoria = todosProductos.filter(p => 
        p.categorias?.some(c => c.id === cat.id)
      );

      return {
        id_grupo: cat.id,
        nombre: cat.nombre,
        ruta: this.crearSlug(cat.nombre),
        productos: prodsDeCategoria.slice(0, 10), 
        tieneMas: prodsDeCategoria.length > 10,
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
}