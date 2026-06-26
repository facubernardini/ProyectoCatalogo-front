import { Component, computed, inject, signal } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "src/app/shared/components/icon";
import { ExploradorProductosService } from 'src/app/shared/services/explorador-productos.service';
import { InfoService } from 'src/app/shared/services/info.service';
import { MapDialogService } from 'src/app/shared/services/map.service';

@Component({
  selector: 'app-menu-lateral-desktop',
  imports: [Icon],
  templateUrl: './menu-lateral-desktop.html',
  styleUrl: './menu-lateral-desktop.css',
})
export class MenuLateralDesktop {
  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
  public mapDialogService = inject(MapDialogService);
  public exploradorProductosService = inject(ExploradorProductosService);
  
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
    this.selected.set(nombre);
    this.exploradorProductosService.verCategoria(nombre);
  }

  abrirDestacados(){
    this.selected.set('destacados');
    this.exploradorProductosService.verDestacados();
  }

  abrirOfertas(){
    this.selected.set('ofertas');
    this.exploradorProductosService.verTodasLasOfertas();
  }

  irAlInicio() {
    this.selected.set(null);
    this.exploradorProductosService.limpiarVista();
  }
}