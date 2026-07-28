import { Component, effect, inject } from '@angular/core';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { ProductSelectorService } from '@shared/services/product-selector.service';
import { SafeHtmlPipe } from 'src/app/core/pipes/safe-html.pipe';
import { Icon } from "@shared/components/icon";
import { trigger, transition, style, animate } from '@angular/animations';
import { ImageViewerService } from '../../services/image-viewer.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-product-selector',
  imports: [SwipeDownDirective, SafeHtmlPipe, Icon],
  templateUrl: './product-selector.html',
  styleUrl: './product-selector.css',
  animations: [
    trigger('popAnimation', [
      transition(':decrement', [
        style({ transform: 'translateY(10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      
      transition(':increment', [
        style({ transform: 'translateY(-10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ProductSelector {
  public productSelectorService = inject(ProductSelectorService);
  public imageViewerService = inject(ImageViewerService);
  private toastService = inject(ToastService);

  public cantidades: Record<number, number> = {};

  constructor() {
    effect(() => {
      if (!this.productSelectorService.isOpen()) {
        this.cantidades = {};
      }
    });
  }

  getCantidad(presId: number): number {
    return this.cantidades[presId] ?? 0;
  }

  incrementar(presId: number) {
    this.cantidades[presId] = this.getCantidad(presId) + 1;
  }

  decrementar(presId: number) {
    const actual = this.getCantidad(presId);
    if (actual > 0) {
      this.cantidades[presId] = actual - 1;
    }
  }

  getTotalItemsSeleccionados(): number {
    return Object.values(this.cantidades).reduce((total, valor) => total + valor, 0);
  }

  agregarSeleccionadosAlCarrito() {
    const productoActual = this.productSelectorService.selectedProduct();
    if (!productoActual) return;

    const cantidadAgregada = this.getTotalItemsSeleccionados();

    if (cantidadAgregada > 0) {
      for (const pres of productoActual.presentaciones) {
        const cantidad = this.getCantidad(pres.id);
        if (cantidad > 0) {
          this.productSelectorService.seleccionarYAgregar(pres, cantidad);
        }
      }

      const texto = cantidadAgregada === 1 ? 'producto agregado' : 'productos agregados';
      
      this.toastService.show(`${cantidadAgregada} ${texto} al carrito 🛒`);
    }

    this.productSelectorService.close();
  }
  
  getPorcentaje(precio_base: number, precio_descuento: number): number {
    if (!precio_descuento || precio_base <= 0) return 0;
    return Math.round(100 - (precio_descuento * 100 / precio_base));
  }

  tieneOfertas(presentaciones: Presentacion[]): boolean {
    return presentaciones.some(p => p.precio_descuento !== null);
  }
}