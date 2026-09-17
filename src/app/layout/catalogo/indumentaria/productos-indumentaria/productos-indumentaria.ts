import { Component, computed, inject, output } from '@angular/core';
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

  // Emitimos evento al hacer clic en "Ver más" para que el padre aplique el filtro
  categoriaSeleccionada = output<CategoriaVendedor>();

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
        productos: prodsDeCategoria.slice(0, 3), // Máximo 10
        tieneMas: prodsDeCategoria.length > 3
      };
    })
    // 3. Ocultamos las categorías que no tienen productos
    .filter(grupo => grupo.productos.length > 0);
  });

  verMas(categoria: CategoriaVendedor) {
    this.categoriaSeleccionada.emit(categoria);
  }
}