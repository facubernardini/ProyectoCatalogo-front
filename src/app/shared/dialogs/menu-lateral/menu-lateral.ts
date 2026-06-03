import { Component, computed, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { MenuLateralService } from '@shared/services/menu-lateral.service';
import { InfoService } from '@shared/services/info.service';
import { MapDialogService } from '@shared/services/map.service';
import { CategoryViewService } from '@shared/services/category-view.service';
import { ProductosDestacadosService } from '@shared/services/productos-destacados.service';
import { ProductosOfertasService } from '@shared/services/productos-ofertas.service';

@Component({
  selector: 'app-menu-lateral',
  imports: [Icon],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.css',
})
export class MenuLateral {
  private categoryViewService = inject(CategoryViewService);
  private productosDestacadosService = inject(ProductosDestacadosService);
  public productosOfertasService = inject(ProductosOfertasService);

  public adminStore = inject(AdminStoreService);
  public menuService = inject(MenuLateralService);
  public infoService = inject(InfoService);
  public mapDialogService = inject(MapDialogService);
  
  categorias = this.adminStore.categorias;

  categoriasOrdenadas = computed(() => {
    const lista = this.categorias();
    
    return [...lista].sort((a, b) => {
      if (a.especial && !b.especial) return -1;
      if (!a.especial && b.especial) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  });

  selected = computed(() => this.menuService.categoriaSeleccionada());

  seleccionarYFechar(nombre: string) {
    this.menuService.close(); 

    this.categoryViewService.open(nombre);
  }

  abrirDestacados(){
    this.menuService.close();
    this.productosDestacadosService.open();
  }

  abrirOfertas(){
    this.menuService.close();
    this.productosOfertasService.open();
  }
}
