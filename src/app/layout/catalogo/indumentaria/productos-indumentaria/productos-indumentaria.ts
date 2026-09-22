import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { ProductCardIndumentaria } from '../product-card-indumentaria/product-card-indumentaria';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';

@Component({
  selector: 'app-productos-indumentaria',
  standalone: true,
  imports: [ProductCardIndumentaria, Icon],
  templateUrl: './productos-indumentaria.html',
})
export class ProductosIndumentaria {
  public adminStore = inject(AdminStoreService);
  private router = inject(Router);

  // Agrupamos y limitamos los productos en tiempo real
  categoriasConProductos = computed(() => {
    const categorias = this.adminStore.categorias();
    const todosProductos = this.adminStore.productos();

    return categorias.map(cat => {
      // 1. Filtramos los productos que pertenecen a esta categoría
      const prodsDeCategoria = todosProductos.filter(p => 
        p.categorias?.some(c => c.id === cat.id)
      );

      // 2. Retornamos la estructura para el carrusel
      return {
        categoria: cat,
        productos: prodsDeCategoria.slice(0, 4), 
        tieneMas: prodsDeCategoria.length > 4
      };
    })
    // 3. Ocultamos las categorías que no tienen productos
    .filter(grupo => grupo.productos.length > 0);
  });

  verMas(categoria: CategoriaVendedor) {
    const slug = this.crearSlug(categoria.nombre);
    
    this.router.navigate(['/', slug]);
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