import { Component, computed, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { MenuLateralService } from 'src/app/core/services/menu-lateral.service';
import { Icon } from "@shared/components/icon";
import { InfoService } from 'src/app/core/services/info.service';
import { CategoryViewService } from 'src/app/core/services/category-view.service';

@Component({
  selector: 'app-menu-lateral',
  imports: [Icon],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.css',
})
export class MenuLateral {
  public adminStore = inject(AdminStoreService);
  public menuService = inject(MenuLateralService);
  public infoService = inject(InfoService);
  private categoryViewService = inject(CategoryViewService);

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
}
