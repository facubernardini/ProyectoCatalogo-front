import { Component, computed, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-banner-info',
  imports: [Icon],
  templateUrl: './banner-info.html',
  styleUrl: './banner-info.css',
})
export class BannerInfo {
  private adminStore = inject(AdminStoreService);

  public anunciosBanner = computed(() => {
    const cat = this.adminStore.catalogo();
    if (!cat) return [];

    const mensajes: { texto: string, icono: string }[] = [];

    if (cat.descuento_en_efectivo && cat.descuento_en_efectivo > 0) {
      mensajes.push({
        texto: `${cat.descuento_en_efectivo}% OFF pagando en efectivo`,
        icono: 'discount'
      });
    }

    if (cat.minimo_compra && cat.minimo_compra > 0) {
      mensajes.push({
        texto: `Mínimo de compra: $${cat.minimo_compra}`,
        icono: 'shop-bag'
      });
    }

    if (cat.envio_gratis_desde && Number(cat.envio_gratis_desde) > 0) {
      mensajes.push({
        texto: `Envío gratis desde: $${cat.envio_gratis_desde}`,
        icono: 'delivery'
      });
    }

    return mensajes;
  });

  public anunciosRepetidos = computed(() => {
    const base = this.anunciosBanner();
    if (base.length === 0) return [];

    const repeticiones = Math.ceil(5 / base.length);
    return Array(repeticiones).fill(base).flat();
  });
}
