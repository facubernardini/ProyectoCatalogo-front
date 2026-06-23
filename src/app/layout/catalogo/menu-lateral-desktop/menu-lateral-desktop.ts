import { Component, computed, inject, signal } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "src/app/shared/components/icon";
import { CategoryViewService } from 'src/app/shared/services/category-view.service';
import { InfoService } from 'src/app/shared/services/info.service';
import { MapDialogService } from 'src/app/shared/services/map.service';
import { ProductosDestacadosService } from 'src/app/shared/services/productos-destacados.service';
import { ProductosOfertasService } from 'src/app/shared/services/productos-ofertas.service';

@Component({
  selector: 'app-menu-lateral-desktop',
  imports: [Icon],
  templateUrl: './menu-lateral-desktop.html',
  styleUrl: './menu-lateral-desktop.css',
})
export class MenuLateralDesktop {
  private categoryViewService = inject(CategoryViewService);
  private productosDestacadosService = inject(ProductosDestacadosService);
  public productosOfertasService = inject(ProductosOfertasService);
  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
  public mapDialogService = inject(MapDialogService);
  
  public selected = signal<string | null>(null);

  categorias = this.adminStore.categorias;

  categoriasOrdenadas = computed(() => {
    const lista = this.categorias();
    
    return [...lista].sort((a, b) => {
      if (a.especial && !b.especial) return -1;
      if (!a.especial && b.especial) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  });

  tieneDestacados = computed(() => {
    return this.adminStore.productos().some(producto => producto.destacado);
  });

  tieneOfertas = computed(() => {
    return this.adminStore.productos().some(producto => 
      producto.presentaciones?.some(pres => pres.precio_descuento && pres.precio_descuento > 0)
    );
  });

  seleccionarYFechar(nombre: string) {
    // 1. Guardamos visualmente qué categoría se tocó en esta barra
    this.selected.set(nombre);
    
    // 2. Abrimos la vista de la categoría
    // (Nota: mantuve tu servicio original. Dependiendo de cómo funcione tu PC, 
    // podrías querer scrollear hasta la categoría en lugar de abrir un modal)
    this.categoryViewService.open(nombre);
  }

  abrirDestacados(){
    this.selected.set('destacados'); // Para desmarcar la categoría activa
    this.productosDestacadosService.open();
  }

  abrirOfertas(){
    this.selected.set('ofertas'); // Para desmarcar la categoría activa
    this.productosOfertasService.open();
  }
}
