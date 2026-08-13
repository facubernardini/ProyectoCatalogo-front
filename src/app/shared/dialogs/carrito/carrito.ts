import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, effect } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CartService } from '@shared/services/cart.service';
import { PedidoRealizadoService } from '@shared/services/pedido-realizado.service';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { SafeHtmlPipe } from 'src/app/core/pipes/safe-html.pipe';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { PedidosServiceBackend } from 'src/app/core/services-backend/pedidos.ServiceBackend';
import { CrearPedidoRequest } from 'src/app/core/models/pedido.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [Icon, SwipeDownDirective, SafeHtmlPipe, CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
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
    ]),
    trigger('popAnimationSimple', [
      transition(':increment, :decrement', [
        style({ opacity: 0 }),
        animate('250ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class Carrito {
  public adminStore = inject(AdminStoreService);
  public cartService = inject(CartService);
  private pedidoRealizadoService = inject(PedidoRealizadoService);
  private toastService = inject(ToastService);
  private pedidosServiceBackend = inject(PedidosServiceBackend);

  catalogo = this.adminStore.catalogo;

  nombreCliente = signal<string>('');
  direccionEnvio = signal<string>('');
  telefonoCliente = signal<string>('');

  isSubmitting = signal<boolean>(false);

  itemParaEliminar = signal<number | null>(null);
  private timeoutEliminar: any;

  constructor() {
    effect(() => {
      const cat = this.catalogo();
      if (cat) {
        this.cartService.setCatalogConfig(
          Number(cat.costo_envio ?? 0),
          Number(cat.envio_gratis_desde ?? 0),
          Number(cat.descuento_en_efectivo),
        );

        if (!cat.ofrece_envio) {
          this.cartService.setDeliveryMethod('Retiro');
        }
      }
    });
  }

  montoFaltante = computed(() => {
    const minimo = Number(this.catalogo()?.minimo_compra ?? 0);
    const precioProductos = this.cartService.priceAfterAllDiscounts();
    return Math.max(0, minimo - precioProductos);
  });

  puedeFinalizar = computed(() => {
    const tieneItems = this.cartService.totalItems() > 0;
    const cumpleMinimo = this.cartService.priceAfterAllDiscounts() >= (this.catalogo()?.minimo_compra ?? 0);
    
    const tieneEntrega = this.cartService.deliveryMethod() !== null;
    const tienePago = this.cartService.selectedPaymentMethod() !== null;
    const nombreValido = this.nombreCliente().trim().length > 3;
    
    const direccionValida = this.cartService.deliveryMethod() === 'Envio' 
        ? this.direccionEnvio().trim().length > 5 
        : true;
    
    return tieneItems && cumpleMinimo && tieneEntrega && tienePago && nombreValido && direccionValida;
  });

  manejarClickRestar(item: any) {
    if (item.cantidad > 1) {
      this.cartService.restarUno(item.presentacionId);
    } else {
      if (this.itemParaEliminar() === item.presentacionId) {
        this.cartService.restarUno(item.presentacionId);
        this.itemParaEliminar.set(null);
        clearTimeout(this.timeoutEliminar);
      } else {
        this.itemParaEliminar.set(item.presentacionId);
        
        clearTimeout(this.timeoutEliminar);
        this.timeoutEliminar = setTimeout(() => {
          this.itemParaEliminar.set(null);
        }, 3000);
      }
    }
  }

  manejarClickSumar(item: any) {
    if (this.itemParaEliminar() === item.presentacionId) {
      this.itemParaEliminar.set(null);
      clearTimeout(this.timeoutEliminar);
    }
    this.cartService.sumarUno(item.presentacionId);
  }

  getPorcentaje(base: number, oferta: number): number {
    if (!base || base <= 0) return 0;
    return Math.round(((base - oferta) / base) * 100);
  }

  seleccionarMetodo(metodo: 'Envio' | 'Retiro', element: HTMLElement) {
    this.cartService.setDeliveryMethod(metodo);
    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  seleccionarPago(mp: any, element: HTMLElement) {
    this.cartService.selectPaymentMethod(mp);
    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  onTelefonoInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    
    let valorLimpio = inputElement.value.replace(/[^0-9]/g, '');
    
    if (valorLimpio.length > 10) {
      valorLimpio = valorLimpio.substring(0, 10);
    }

    inputElement.value = valorLimpio;
    
    this.telefonoCliente.set(valorLimpio);
  }

  limpiarFormulario() {
    this.cartService.setDeliveryMethod(null as any);
    this.cartService.selectPaymentMethod(null as any);
    this.nombreCliente.set('');
    this.direccionEnvio.set('');
    this.telefonoCliente.set('');
    
    if (this.cartService.appliedCupon()) {
      this.cartService.removerCupon();
    }

    const cat = this.catalogo();
    if (cat && !cat.ofrece_envio) {
      this.cartService.setDeliveryMethod('Retiro');
    }

    this.toastService.show('Se han limpiado tus datos', 'info');
  }

  finalizarPedido() {
    if (this.cartService.totalItems() === 0) {
      this.toastService.show('El carrito está vacío', 'error');
      return;
    }

    if (this.cartService.priceAfterAllDiscounts() < (this.catalogo()?.minimo_compra ?? 0)) {
      this.toastService.show('No superaste el mínimo de compra', 'error');
      return;
    }

    if (!this.cartService.deliveryMethod()) {
      this.toastService.show('Seleccioná un método de entrega', 'error');
      document.getElementById('seccion-entrega')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!this.cartService.selectedPaymentMethod()) {
      this.toastService.show('Seleccioná un método de pago', 'error');
      document.getElementById('seccion-pago')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (this.nombreCliente().trim().length <= 3) {
      this.toastService.show('Ingresá tu nombre y apellido', 'error');
      document.getElementById('seccion-datos')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (this.cartService.deliveryMethod() === 'Envio' && this.direccionEnvio().trim().length <= 5) {
      this.toastService.show('Ingresá la dirección de envío', 'error');
      document.getElementById('seccion-datos')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const items = this.cartService.items();
    const envio = this.cartService.deliveryMethod() === 'Envio';
    const cupon = this.cartService.appliedCupon();
    const catalogoId = this.catalogo()?.id;
    const metodoPago = this.cartService.selectedPaymentMethod()?.nombre;
    const deliveryMethod = this.cartService.deliveryMethod() || 'Retiro';

    if (!catalogoId) {
      this.toastService.show('Error al identificar el catálogo', 'error');
      return;
    }

    let costoEnvioFinal = 0;
    
    if (envio && this.catalogo()) {
      if (this.cartService.esEnvioGratis()) {
        costoEnvioFinal = 0;
      } else {
        costoEnvioFinal = Number(this.catalogo()?.costo_envio) || 0;
      }
    }

    // 3. Armamos el Payload (CrearPedidoRequest) para el backend
    const payload: CrearPedidoRequest = {
      catalogo_id: Number(catalogoId),
      comprador_nombre: this.nombreCliente().trim(),
      comprador_direccion: envio ? this.direccionEnvio().trim() : null,
      comprador_telefono: this.telefonoCliente() ? this.telefonoCliente() : null,
      metodo_entrega: deliveryMethod,
      costo_envio: costoEnvioFinal,
      metodo_pago: String(metodoPago),
      cupon_codigo: cupon ? cupon.codigo : null,
      productos: items.map(item => ({
        producto_id: item.productoId,
        presentacion_id: item.presentacionId,
        cantidad: item.cantidad
      }))
    };

    this.isSubmitting.set(true);

    // 4. Llamamos al backend para registrar la compra
    this.pedidosServiceBackend.registrarPedido(payload).subscribe({
      next: (response) => {
        const numeroPedidoFormateado = `#${response.numero_pedido}`;

        // 5. Armamos el mensaje de WhatsApp incluyendo el Número de Pedido
        let mensaje = `🛎️ NUEVO PEDIDO ${numeroPedidoFormateado} de *${this.nombreCliente().trim()}*\n\n`;

        if (envio) {
          mensaje += `🛵 Envío a domicilio: *${this.direccionEnvio().trim()}*\n`;
        } else {
          mensaje += `🏪 Retiro en el local\n`;
        }

        mensaje += `💵 Medio de pago: *${this.cartService.selectedPaymentMethod()?.nombre}*\n\n`;

        // Productos
        mensaje += `🛒 *Detalle del pedido*\n`;
        mensaje += ` ────────────────\n`;
        items.forEach(item => {
          const subtotalItem = item.precio * item.cantidad;
          let lineaItem = `• ${item.cantidad} x ${item.nombre} (${item.unidad}): *$${subtotalItem.toLocaleString('es-AR')}*`;
          if (item.cantidad >= 2) {
            lineaItem += ` _($${item.precio.toLocaleString('es-AR')} c/u)_`; 
          }
          mensaje += lineaItem + `\n`;
        });
        mensaje += ` ────────────────\n\n`;

        // Resumen
        mensaje += `🧾 *Resumen de cuenta*\n`;
        mensaje += `🛍️ Productos: *$${this.cartService.subtotalPrice().toLocaleString('es-AR')}*\n`;

        if (cupon) {
          mensaje += `🎟️ Cupón (${cupon.codigo}): *-$${this.cartService.discountAmount().toLocaleString('es-AR')}*\n`;
        }

        const descuentoEfectivo = this.cartService.cashDiscountAmount();
        const porcentajeEfectivo = this.cartService.catalogConfig()?.descuentoEfectivo;
        if (descuentoEfectivo > 0 && porcentajeEfectivo) {
          mensaje += `💸 Dto. pago en efectivo (${porcentajeEfectivo}%): *-$${descuentoEfectivo.toLocaleString('es-AR')}*\n`;
        }

        if (envio) {
          if (this.cartService.esEnvioGratis()) {
            mensaje += `🛵 Costo de envío: *Bonificado*\n`;
          } else {
            const costoEnvioSeguro = Number(this.catalogo()?.costo_envio || 0);
            mensaje += `🛵 Costo de envío: *$${costoEnvioSeguro.toLocaleString('es-AR')}*\n`;
          }
        }

        mensaje += `\n💰 *TOTAL:   $${this.cartService.totalFinal().toLocaleString('es-AR')}*`;

        // 6. Ejecutamos las acciones finales
        const phone = this.catalogo()?.wpp_numero;
        const url = `https://api.whatsapp.com/send?phone=549${phone}&text=${encodeURIComponent(mensaje)}`;
        
        window.open(url, '_blank');
        //this.enviarAlertaTelegram(mensaje);

        this.cartService.limpiarCarrito(true);
        this.nombreCliente.set('');
        this.direccionEnvio.set('');
        this.telefonoCliente.set('');

        this.isSubmitting.set(false);

        setTimeout(() => {
          this.pedidoRealizadoService.open(deliveryMethod, url);
        }, 5000);
      },
      error: (err) => {
        console.error('Error al registrar pedido', err);
        this.toastService.show('Ups! Algo salió mal, vuelve a intentarlo', 'error');
        this.isSubmitting.set(false);
      }
    });
  }

  // Prueba temporal
  private enviarAlertaTelegram(mensaje: string) {
    const token = "8649133296:AAHzrBQtAJbYCPQHOdIT5N-UU7ryEgJVHCk";
    const chatId = "5097936005";

    const nombreTienda = this.catalogo()?.nombre_tienda;
    const mensajeTelegram = `🏢 *Tienda: ${nombreTienda}*\n────────────────\n${mensaje}`;
    
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&parse_mode=Markdown&text=${encodeURIComponent(mensajeTelegram)}`;
    
    fetch(url).catch(e => console.error("Error al enviar alerta de Telegram", e));
  }
}