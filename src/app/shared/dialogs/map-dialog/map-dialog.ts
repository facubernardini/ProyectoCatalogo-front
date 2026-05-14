import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from '@shared/components/icon';
import { MapDialogService } from 'src/app/core/services/map.service';

@Component({
  selector: 'app-map-dialog',
  imports: [CommonModule, Icon],
  templateUrl: './map-dialog.html'
})
export class MapDialog {
  public mapDialogService = inject(MapDialogService);
  public adminStore = inject(AdminStoreService);
  private sanitizer = inject(DomSanitizer);

  public mapUrl = computed(() => {
    const cat = this.adminStore.catalogo();
    
    if (!cat || !cat.direccion || !cat.ciudad) return null;

    const busqueda = `${cat.direccion}, ${cat.ciudad}, Argentina`;
    
    const queryCodificada = encodeURIComponent(busqueda);
    
    const urlCruda = `https://maps.google.com/maps?q=${queryCodificada}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlCruda);
  });
}