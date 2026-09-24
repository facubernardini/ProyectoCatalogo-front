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
        productos: prodsDestacados.slice(0, 4),
        tieneMas: prodsDestacados.length > 4
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
        productos: prodsOfertas.slice(0, 4),
        tieneMas: prodsOfertas.length > 4
      });
    }

    // --- 3. CATEGORÍAS NORMALES ---
    const gruposCategorias = categorias.map(cat => {
      const prodsDeCategoria = todosProductos.filter(p => 
        p.categorias?.some(c => c.id === cat.id)
      );

      return {
        id_grupo: cat.id,
        nombre: cat.nombre,
        ruta: this.crearSlug(cat.nombre),
        productos: prodsDeCategoria.slice(0, 4), 
        tieneMas: prodsDeCategoria.length > 4
      };
    }).filter(grupo => grupo.productos.length > 0);

    return [...grupos, ...gruposCategorias];
  });

  verMas(rutaDestino: string) {
    this.router.navigate(['/', rutaDestino]);
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