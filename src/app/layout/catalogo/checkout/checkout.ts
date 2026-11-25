import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RateDTO } from 'src/app/core/models/correo-argentino/rates.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CorreoArgentinoService } from 'src/app/core/services/correo-argentino.service';
import { APP_CONFIG } from 'src/app/shared/constants/app.constants';
import { CodigoProvincia, DeliveredType } from 'src/app/shared/enums/correo-argentino.enum';
import { MetodoEntrega } from 'src/app/shared/enums/metodo-entrega.enum';
import { CartService } from 'src/app/shared/services/cart.service';
import { Icon } from 'src/app/shared/components/icon';
import { PedidosServiceBackend } from 'src/app/core/services-backend/pedidos.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { PedidoRealizadoService } from 'src/app/shared/services/pedido-realizado.service';
import { finalize } from 'rxjs';
import { CrearPedidoRequest, DetalleEnvioRequest } from 'src/app/core/models/pedido.model';
import { TipoPlanEnum } from 'src/app/shared/enums/tipo-plan.enum';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  public cartService = inject(CartService);
  public adminStore = inject(AdminStoreService);
  private router = inject(Router);
  private cotizadorService = inject(CorreoArgentinoService);
  private pedidosServiceBackend = inject(PedidosServiceBackend);
  private toastService = inject(ToastService);
  private pedidoRealizadoService = inject(PedidoRealizadoService);

  isSubmitting = signal(false);
  sucursalSeleccionadaId = signal<string | null>(null);
  
  private readonly CONSTANTS = APP_CONFIG;

  catalogo = this.adminStore.catalogo;
  public readonly MetodoEntrega = MetodoEntrega;

  tipoEntrega = this.cartService.deliveryMethod;

  datosComprador = {
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion_local: '',
    calle: '',
    numero: '',
    piso: '',
    departamento: '',
    ciudad: '',
    provincia: '',
    codigo_postal: ''
  };

  codigoCuponInput = signal('');
  mostrarInputCupon = signal(false);
  
  tarifasCorreo = signal<RateDTO[]>([]);
  cargandoTarifas = signal(false);
  errorTarifas = signal<string | null>(null);
  
  tarifaSeleccionada = signal<RateDTO | null>(null);

  enviosDomicilio = computed(() => {
    return this.tarifasCorreo().filter(rate => rate.deliveredType === DeliveredType.D);
  });

  retirosSucursal = computed(() => {
    return this.tarifasCorreo().filter(rate => rate.deliveredType === DeliveredType.S);
  });

  constructor() {
    effect(() => {
      const metodo = this.cartService.deliveryMethod();
      if (metodo !== MetodoEntrega.ENVIO_CORREO_ARG) {
        this.tarifaSeleccionada.set(null);
      }
    });
  }

  ngOnInit() {
    const cat = this.catalogo();
    if (cat) {
      this.cartService.setCatalogConfig(
        cat.costo_envio ?? 0, 
        cat.envio_gratis_desde ?? 0, 
        cat.descuento_en_efectivo ?? 0, 
        cat.envio_a_coordinar ?? false
      );
    }

    const savedCP = localStorage.getItem(this.CONSTANTS.CP_STORAGE_KEY);
    if (savedCP && savedCP.trim().length >= 4) {
      this.datosComprador.codigo_postal = savedCP.trim();
      
      if (cat?.ofrece_correo_arg) {
        this.cotizarCorreoArgentino();
      }
    }
  }

  volver() {
    this.router.navigate(['/']);
  }

  seleccionarEntrega(tipo: MetodoEntrega | null) {
    this.cartService.setDeliveryMethod(tipo);
  }

  seleccionarTarifaCorreo(tarifa: RateDTO) {
    this.tarifaSeleccionada.set(tarifa);
  }

  cotizarCorreoArgentino() {
    const cp = String(this.datosComprador.codigo_postal).trim();
    if (!cp || cp.length < 4) {
      this.errorTarifas.set('Ingresá un código postal válido.');
      return;
    }

    const slug = this.catalogo()?.slug || '';
    const items = this.cartService.items();
    const productos = this.adminStore.productos();
    
    this.cargandoTarifas.set(true);
    this.errorTarifas.set(null);
    this.tarifasCorreo.set([]);
    this.tarifaSeleccionada.set(null);

    this.cotizadorService.cotizarCarrito(slug, cp, items, productos).subscribe({
      next: (tarifas) => {
        this.cargandoTarifas.set(false);
        if (tarifas.length > 0) {
          this.tarifasCorreo.set(tarifas);
        } else {
          this.errorTarifas.set('No hay envíos disponibles para este destino.');
        }
      },
      error: (err) => {
        this.cargandoTarifas.set(false);
        this.errorTarifas.set(err.message || 'Error al cotizar.');
      }
    });
  }

  aplicarCupon() {
    const codigo = this.codigoCuponInput().trim();
    const catalogoId = this.catalogo()?.id;
    if (codigo && catalogoId) {
      this.cartService.aplicarCupon(codigo, catalogoId);
    }
  }

  removerCupon() {
    this.cartService.removerCupon();
    
    this.codigoCuponInput.set('');
    this.mostrarInputCupon.set(true);
  }

  obtenerCostoEnvio(): number {
    const metodo = this.cartService.deliveryMethod();
    if (metodo === MetodoEntrega.ENVIO_LOCAL) {
      const config = this.cartService.catalogConfig();
      if (!config || config.envioACoordinar || this.cartService.esEnvioGratis()) {
        return 0;
      }
      return config.costoEnvio || 0;
    } 
    if (metodo === MetodoEntrega.ENVIO_CORREO_ARG) {
      const tarifa = this.tarifaSeleccionada();
      return tarifa ? tarifa.price : 0;
    }
    return 0;
  }

  obtenerTotalFinal(): number {
    // Usamos el totalBase (con todos los descuentos aplicados, incluyendo cupón y efectivo)
    // PERO no le sumamos el costoEnvio local (porque ya se encarga el cartService de eso en totalFinal si es envío local)
    // Entonces, calculamos manualmente: priceAfterAllDiscounts + nuestro cálculo dinámico de envío
    const totalBase = this.cartService.priceAfterAllDiscounts();
    return totalBase + this.obtenerCostoEnvio();
  }

  finalizarCompra() {
    if (this.isSubmitting()) return;
    if (!this.validarFormulario()) return;

    const catalogo = this.catalogo();
    const metodo = this.tipoEntrega();
    if (!catalogo?.id || !metodo) return;

    const esPlanBasico = catalogo.plan_vendedor === TipoPlanEnum.BASICO;

    this.isSubmitting.set(true);

    if (esPlanBasico) {
      this.enviarWhatsappYLimpiar(null, metodo);
      this.isSubmitting.set(false);
      return;
    }

    const payload = this.construirPayloadPedido(catalogo.id, metodo);

    this.pedidosServiceBackend.registrarPedido(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          const numeroPedidoFormateado = `#${response.numero_pedido}`;
          this.enviarWhatsappYLimpiar(numeroPedidoFormateado, metodo);
        },
        error: (err) => {
          console.error('Error al registrar pedido desde checkout:', err);
          this.toastService.show(
            err.error?.message || err.error?.error || 'Ups! Algo salió mal, volvé a intentarlo',
            'error'
          );
        }
      });
  }

  private validarFormulario(): boolean {
    if (this.cartService.totalItems() === 0) {
      this.toastService.show('El carrito está vacío', 'error');
      return false;
    }

    if (this.cartService.priceAfterAllDiscounts() < (this.catalogo()?.minimo_compra ?? 0)) {
      this.toastService.show('No superaste el mínimo de compra', 'error');
      return false;
    }

    const metodo = this.tipoEntrega();
    if (!metodo) {
      this.toastService.show('Seleccioná un método de entrega', 'error');
      return false;
    }

    const { nombre, apellido, telefono, email, direccion_local, calle, numero, ciudad, provincia, codigo_postal } = this.datosComprador;

    if (nombre.trim().length < 2 || apellido.trim().length < 2) {
      this.toastService.show('Ingresá tu nombre y apellido', 'error');
      return false;
    }

    const telLimpio = telefono.replace(/[^0-9]/g, '');
    if (telLimpio.length < 10) {
      this.toastService.show('Ingresá un teléfono válido (10 dígitos, sin 0 ni 15)', 'error');
      return false;
    }

    // Validación condicional: Envío Local
    if (metodo === MetodoEntrega.ENVIO_LOCAL && direccion_local.trim().length <= 5) {
      this.toastService.show('Ingresá la dirección para el envío local', 'error');
      return false;
    }

    // Validación condicional: Correo Argentino
    if (metodo === MetodoEntrega.ENVIO_CORREO_ARG) {
      const tarifa = this.tarifaSeleccionada();
      if (!tarifa) {
        this.toastService.show('Cotizá y elegí una opción de Correo Argentino', 'error');
        return false;
      }

      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        this.toastService.show('Ingresá un email válido para el seguimiento del envío', 'error');
        return false;
      }
      
      if (tarifa.deliveredType === DeliveredType.D) {
        if (!calle.trim() || !numero.trim()) {
          this.toastService.show('Ingresá calle y altura para la entrega a domicilio', 'error');
          return false;
        }
      }

      if (ciudad.trim().length < 2) {
        this.toastService.show('Ingresá tu localidad o ciudad', 'error');
        return false;
      }
      
      if (!codigo_postal.trim() || codigo_postal.trim().length < 4) {
        this.toastService.show('Ingresá un código postal válido', 'error');
        return false;
      }

      if (!provincia) {
        this.toastService.show('Seleccioná tu provincia', 'error');
        return false;
      }


      if (tarifa.deliveredType === DeliveredType.S && !this.sucursalSeleccionadaId()) {
        this.toastService.show('Seleccioná la sucursal de Correo Argentino', 'error');
        return false;
      }
    }

    return true;
  }

  private construirPayloadPedido(catalogoId: number, metodo: MetodoEntrega): CrearPedidoRequest {
    const { nombre, apellido, telefono, direccion_local } = this.datosComprador;
    const cupon = this.cartService.appliedCupon();
    const metodoPago = this.cartService.selectedPaymentMethod()?.nombre ?? 'A coordinar';
    const esEnvioLocal = metodo === MetodoEntrega.ENVIO_LOCAL;
    const esCorreoArg = metodo === MetodoEntrega.ENVIO_CORREO_ARG;

    const quedoACoordinar = esEnvioLocal
      ? (!!this.catalogo()?.envio_a_coordinar && !this.cartService.esEnvioGratis())
      : false;

    const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`;
    const telefonoLimpio = telefono.replace(/[^0-9]/g, '') || null;

    return {
      catalogo_id: Number(catalogoId),
      comprador_nombre: nombreCompleto,
      comprador_direccion: esEnvioLocal ? direccion_local.trim() : null,
      comprador_telefono: telefonoLimpio,
      metodo_entrega: metodo,
      envio_a_coordinar: quedoACoordinar,
      costo_envio: this.obtenerCostoEnvio(),
      metodo_pago: metodoPago,
      cupon_codigo: cupon ? cupon.codigo : null,
      productos: this.cartService.items().map(item => ({
        producto_id: item.productoId,
        presentacion_id: item.presentacionId,
        cantidad: item.cantidad
      })),
      detalle_envio: esCorreoArg ? this.construirDetalleEnvio() : null
    };
  }

  private construirDetalleEnvio(): DetalleEnvioRequest {
    const tarifa = this.tarifaSeleccionada()!;
    const esDomicilio = tarifa.deliveredType === DeliveredType.D;
    const { email, calle, numero, piso, departamento, ciudad, provincia, codigo_postal } = this.datosComprador;

    return {
      destinatario_email: email.trim(),
      calle: esDomicilio ? calle.trim() : null,
      numero: esDomicilio ? numero.trim() : null,
      piso: esDomicilio ? (piso.trim() || null) : null,
      departamento: esDomicilio ? (departamento.trim() || null) : null,
      ciudad: ciudad.trim(),
      provincia_codigo: provincia as CodigoProvincia,
      codigo_postal: codigo_postal.trim(),
      tipo_envio: tarifa.productType,
      envio_a: tarifa.deliveredType,
      sucursal_id: !esDomicilio ? this.sucursalSeleccionadaId() : null
    };
  }

  private enviarWhatsappYLimpiar(numeroPedido: string | null, metodo: MetodoEntrega) {
    const nombreCompleto = `${this.datosComprador.nombre.trim()} ${this.datosComprador.apellido.trim()}`;
    const items = this.cartService.items();
    const cupon = this.cartService.appliedCupon();
    const tarifa = this.tarifaSeleccionada();
    const costoEnvio = this.obtenerCostoEnvio();

    let mensaje = numeroPedido
      ? `🛎️ NUEVO PEDIDO ${numeroPedido} de *${nombreCompleto}*\n\n`
      : `🛎️ NUEVO PEDIDO de *${nombreCompleto}*\n\n`;

    if (metodo === MetodoEntrega.ENVIO_LOCAL) {
      mensaje += `🛵 Envío a domicilio: *${this.datosComprador.direccion_local.trim()}*\n`;
    } else if (metodo === MetodoEntrega.ENVIO_CORREO_ARG && tarifa) {
      const servicio = tarifa.productType === 'CP' ? 'Clásico' : 'Expreso';
      const destino = tarifa.deliveredType === DeliveredType.D
        ? `a domicilio (${this.datosComprador.calle.trim()} ${this.datosComprador.numero.trim()}, ${this.datosComprador.ciudad.trim()}, CP ${this.datosComprador.codigo_postal.trim()})`
        : `a sucursal (CP ${this.datosComprador.codigo_postal.trim()})`;
      mensaje += `📦 Correo Argentino ${servicio} ${destino}\n`;
    } else {
      mensaje += `🏪 Retiro en el local\n`;
    }

    mensaje += `💵 Medio de pago: *${this.cartService.selectedPaymentMethod()?.nombre ?? 'A coordinar'}*\n\n`;

    mensaje += `🛒 *Detalle del pedido*\n ────────────────\n`;
    items.forEach(item => {
      const subtotalItem = item.precio * item.cantidad;
      let linea = `• ${item.cantidad} x ${item.nombre} (${item.unidad}): *$${subtotalItem.toLocaleString('es-AR')}*`;
      if (item.cantidad >= 2) {
        linea += ` _($${item.precio.toLocaleString('es-AR')} c/u)_`;
      }
      mensaje += linea + `\n`;
    });
    mensaje += ` ────────────────\n\n`;

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

    if (metodo === MetodoEntrega.ENVIO_LOCAL) {
      if (this.cartService.esEnvioGratis()) {
        mensaje += `🛵 Costo de envío: *Bonificado*\n`;
      } else if (this.catalogo()?.envio_a_coordinar) {
        mensaje += `🛵 Costo de envío: *A coordinar*\n`;
      } else {
        mensaje += `🛵 Costo de envío: *$${costoEnvio.toLocaleString('es-AR')}*\n`;
      }
    } else if (metodo === MetodoEntrega.ENVIO_CORREO_ARG) {
      mensaje += `📦 Costo de envío (Correo Arg.): *$${costoEnvio.toLocaleString('es-AR')}*\n`;
    }

    mensaje += `\n💰 *TOTAL:   $${this.obtenerTotalFinal().toLocaleString('es-AR')}*`;

    const phone = this.catalogo()?.wpp_numero;
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const url = `https://api.whatsapp.com/send?phone=549${phone}&text=${encodeURIComponent(mensaje)}`;

    if (isIOS) {
      window.location.href = `https://wa.me/549${phone}?text=${encodeURIComponent(mensaje)}`;
    } else {
      window.open(url, '_blank');
    }

    this.cartService.limpiarCarrito(true);
    this.router.navigate(['/']);

    setTimeout(() => {
      this.pedidoRealizadoService.open(url);
    }, 1500);
  }
}