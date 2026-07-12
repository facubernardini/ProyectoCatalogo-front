import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { InfoService } from '@shared/services/info.service';
import { MapDialogService } from '@shared/services/map.service';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-menu-info',
  imports: [Icon, SwipeDownDirective],
  templateUrl: './menu-info.html',
  styleUrl: './menu-info.css',
})
export class MenuInfo {
  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
  public mapDialogService = inject(MapDialogService);

  catalogo = this.adminStore.catalogo;

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
