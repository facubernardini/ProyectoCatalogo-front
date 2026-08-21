import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "src/app/shared/components/icon";
import { ExploradorProductosService } from 'src/app/shared/services/explorador-productos.service';
import { InfoService } from 'src/app/shared/services/info.service';
import { MapDialogService } from 'src/app/shared/services/map.service';

@Component({
  selector: 'app-menu-lateral-desktop',
  imports: [Icon, CommonModule],
  templateUrl: './menu-lateral-desktop.html',
  styleUrl: './menu-lateral-desktop.css',
})
export class MenuLateralDesktop {
  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
  public mapDialogService = inject(MapDialogService);
  public exploradorProductosService = inject(ExploradorProductosService);

  catalogo = this.adminStore.catalogo;
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
    this.exploradorProductosService.verCategoria(nombre);
  }

  abrirDestacados(){
    this.exploradorProductosService.verDestacados();
  }

  abrirOfertas(){
    this.exploradorProductosService.verTodasLasOfertas();
  }

  abrirWhatsapp(): void {
    const numero = this.catalogo()?.wpp_numero;
    if (!numero) {
      console.warn('No hay número de WhatsApp configurado.');
      return;
    }
    
    const url = `https://wa.me/+549${numero}`;
    
    window.open(url, '_blank');
  }

  abrirInstagram(): void {
    const usuario = this.catalogo()?.instagram_usuario;
    if (!usuario) {
      console.warn('No hay usuario de Instagram configurado.');
      return;
    }

    const url = `https://instagram.com/${usuario}`;
    
    window.open(url, '_blank');
  }
}