import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DimensionsDTO, RateDTO } from 'src/app/core/models/correo-argentino/rates.model';
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
import { MedioPago } from 'src/app/shared/enums/medio-pago.enum';
import { ResponseAgencyDTO } from 'src/app/core/models/correo-argentino/agencies.model';

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

  catalogo = this.adminStore.catalogo;
  
  isSubmitting = signal(false);

  private readonly CONSTANTS = APP_CONFIG;

  public readonly MetodoEntrega = MetodoEntrega;
  public readonly DeliveredType = DeliveredType;

  tipoEntrega = this.cartService.deliveryMethod;

  datosComprador = {
    email: 'test@asd.com',
    nombre: 'fa',
    apellido: 'be',
    telefono: '2323232323',
    direccion_local: '',
    calle: 'belgra',
    numero: '123',
    piso: '',
    depto: '',
    ciudad: 'pi',
    provincia: 'B',
    codigo_postal: '8170'
  };

  codigoCuponInput = signal('');
  mostrarInputCupon = signal(false);
  
  dimensionesCotizadas = signal<DimensionsDTO | null>(null);

  // Tarifas de envio
  tarifasCorreo = signal<RateDTO[]>([]);
  cargandoTarifas = signal(false);
  errorTarifas = signal<string | null>(null);
  tarifaSeleccionada = signal<RateDTO | null>(null);

  // Sucursales para retirar paquete
  sucursalesDisponibles = signal<ResponseAgencyDTO[]>([]);
  cargandoSucursales = signal(false);
  errorSucursales = signal<string | null>(null);
  provinciaConsultada = signal<string | null>(null);

  cpCotizado = signal('');

  sucursalSeleccionada = signal<ResponseAgencyDTO | null>(null);
  sucursalSeleccionadaId = computed(() => this.sucursalSeleccionada()?.code ?? null);

  enviosDomicilio = computed(() => {
    return this.tarifasCorreo().filter(rate => rate.deliveredType === DeliveredType.D);
  });

  retirosSucursal = computed(() => {
    return this.tarifasCorreo().filter(rate => rate.deliveredType === DeliveredType.S);
  });

  sucursalesCercanas = computed(() => {
    const cp = this.cpCotizado().replace(/\D/g, '').slice(0, 4);
    if (cp.length < 4) return [];
    return this.sucursalesDisponibles().filter(s => s.postalCode.includes(cp));
  });

  constructor() {
    effect(() => {
      const metodo = this.cartService.deliveryMethod();
      if (metodo !== MetodoEntrega.ENVIO_CORREO_ARG) {
        this.tarifaSeleccionada.set(null);
        this.sucursalSeleccionada.set(null);
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

    if (tarifa.deliveredType === DeliveredType.S) {
      if (!this.datosComprador.provincia) {
        const provinciaInferida = this.inferirProvinciaPorCP(this.datosComprador.codigo_postal);
        if (provinciaInferida) {
          this.datosComprador.provincia = provinciaInferida;
        }
      }

      if (this.datosComprador.provincia) {
        this.cargarSucursales(this.datosComprador.provincia);
      }
    } else {
      this.sucursalSeleccionada.set(null);
    }
  }

  cargarSucursales(codigoProvincia: string) {
    const slug = this.catalogo()?.slug;
    const prov = codigoProvincia.trim().toUpperCase();
    if (!slug || prov.length !== 1) return;

    if (this.provinciaConsultada() === prov && this.sucursalesDisponibles().length > 0) {
      const cercanas = this.sucursalesCercanas();
      this.sucursalSeleccionada.set(cercanas.length === 1 ? cercanas[0] : null);
      return;
    }

    this.cargandoSucursales.set(true);
    this.errorSucursales.set(null);
    this.sucursalesDisponibles.set([]);
    this.sucursalSeleccionada.set(null);

    this.cotizadorService.obtenerSucursales(slug, prov).subscribe({
      next: (sucursales) => {
        this.cargandoSucursales.set(false);
        this.provinciaConsultada.set(prov);
        this.sucursalesDisponibles.set(sucursales);

        // Si hay una sola sucursal exacta para su CP, la preselecciona automáticamente
        const cercanas = this.sucursalesCercanas();
        if (cercanas.length === 1) {
          this.sucursalSeleccionada.set(cercanas[0]);
        }
      },
      error: (err) => {
        this.cargandoSucursales.set(false);
        this.errorSucursales.set(err.message || 'No pudimos cargar las sucursales.');
      }
    });
  }

  onSucursalChange(code: string) {
    const encontrada = this.sucursalesDisponibles().find(s => s.code === code) ?? null;
    this.sucursalSeleccionada.set(encontrada);
  }

  onProvinciaChange(nuevaProvincia: string) {
    this.datosComprador.provincia = nuevaProvincia;
    this.sucursalSeleccionada.set(null);

    if (this.tarifaSeleccionada()?.deliveredType === DeliveredType.S && nuevaProvincia) {
      this.cargarSucursales(nuevaProvincia);
    }
  }

  private inferirProvinciaPorCP(cpRaw: string): CodigoProvincia | null {
    const cp = Number(cpRaw.replace(/\D/g, '').slice(0, 4));
    if (!cp || isNaN(cp)) return null;

    if (cp >= 1000 && cp <= 1499) return CodigoProvincia.CABA;
    if ((cp >= 1600 && cp <= 1999) || (cp >= 2700 && cp <= 2999) || (cp >= 6000 && cp <= 8199)) return CodigoProvincia.BUENOS_AIRES;
    if (cp >= 2000 && cp <= 2699) return CodigoProvincia.SANTA_FE;
    if (cp >= 3000 && cp <= 3099) return CodigoProvincia.SANTA_FE;
    if (cp >= 3100 && cp <= 3299) return CodigoProvincia.ENTRE_RIOS;
    if (cp >= 3300 && cp <= 3399) return CodigoProvincia.MISIONES;
    if (cp >= 3400 && cp <= 3499) return CodigoProvincia.CORRIENTES;
    if (cp >= 3500 && cp <= 3599) return CodigoProvincia.CHACO;
    if (cp >= 3600 && cp <= 3699) return CodigoProvincia.FORMOSA;
    if (cp >= 3700 && cp <= 3799) return CodigoProvincia.CHACO;
    if (cp >= 4000 && cp <= 4199) return CodigoProvincia.TUCUMAN;
    if (cp >= 4200 && cp <= 4399) return CodigoProvincia.SANTIAGO_DEL_ESTERO;
    if (cp >= 4400 && cp <= 4599) return CodigoProvincia.SALTA;
    if (cp >= 4600 && cp <= 4699) return CodigoProvincia.JUJUY;
    if (cp >= 4700 && cp <= 4799) return CodigoProvincia.CATAMARCA;
    if (cp >= 5000 && cp <= 5299) return CodigoProvincia.CORDOBA;
    if (cp >= 5300 && cp <= 5399) return CodigoProvincia.LA_RIOJA;
    if (cp >= 5400 && cp <= 5499) return CodigoProvincia.SAN_JUAN;
    if (cp >= 5500 && cp <= 5699) return CodigoProvincia.MENDOZA;
    if (cp >= 5700 && cp <= 5899) return CodigoProvincia.SAN_LUIS;
    if (cp >= 6300 && cp <= 6399) return CodigoProvincia.LA_PAMPA;
    if (cp >= 8300 && cp <= 8399) return CodigoProvincia.NEUQUEN;
    if (cp >= 8400 && cp <= 8599) return CodigoProvincia.RIO_NEGRO;
    if (cp >= 9000 && cp <= 9299) return CodigoProvincia.CHUBUT;
    if (cp >= 9300 && cp <= 9409) return CodigoProvincia.SANTA_CRUZ;
    if (cp >= 9410 && cp <= 9429) return CodigoProvincia.TIERRA_DEL_FUEGO;

    return null;
  }

  limpiarTarifaSeleccionada() {
    this.tarifaSeleccionada.set(null);
    this.sucursalSeleccionada.set(null);
  }

  cotizarCorreoArgentino() {
    const cp = String(this.datosComprador.codigo_postal).trim();
    if (!cp || cp.length < 4) {
      this.errorTarifas.set('Ingresá un código postal válido.');
      return;
    }

    this.cpCotizado.set(cp);

    const slug = this.catalogo()?.slug || '';
    const items = this.cartService.items();
    const productos = this.adminStore.productos();

    this.cargandoTarifas.set(true);
    this.errorTarifas.set(null);
    this.tarifasCorreo.set([]);
    this.tarifaSeleccionada.set(null);
    this.sucursalSeleccionada.set(null);
    this.dimensionesCotizadas.set(null);

    this.cotizadorService.cotizarCarrito(slug, cp, items, productos).subscribe({
      next: (res) => {
        this.cargandoTarifas.set(false);
        if (res.rates.length > 0) {
          this.tarifasCorreo.set(res.rates);
          this.dimensionesCotizadas.set(res.dimensions);
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
          // Construimos la URL de WhatsApp para pasarla por router state (o reconstruirla en /compras/:id)
          const whatsappUrl = this.enviarWhatsappYLimpiar(`#${response.numero_pedido}`, metodo);
          this.cartService.limpiarCarrito(true);
          this.router.navigate(['/compras', response.id], {
            state: { whatsappUrl, recienCreado: true }
          });
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
      if (!tarifa || !this.dimensionesCotizadas()) {
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
        if (ciudad.trim().length < 2) {
          this.toastService.show('Ingresá tu localidad o ciudad', 'error');
          return false;
        }
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
    
    const esEnvioLocal = metodo === MetodoEntrega.ENVIO_LOCAL;
    const esCorreoArg = metodo === MetodoEntrega.ENVIO_CORREO_ARG;

    const metodoPago = esCorreoArg
      ? (this.cartService.selectedPaymentMethod()?.nombre ?? MedioPago.TRANSFERENCIA)
      : (this.cartService.selectedPaymentMethod()?.nombre ?? 'A coordinar');

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
    const dimensiones = this.dimensionesCotizadas()!; // <-- signal donde guardaste response.dimensions
    const esDomicilio = tarifa.deliveredType === DeliveredType.D;
    const { email, calle, numero, piso, depto, ciudad, provincia, codigo_postal } = this.datosComprador;

    return {
      destinatario_email: email.trim(),
      calle: esDomicilio ? calle.trim() : null,
      numero: esDomicilio ? numero.trim() : null,
      piso: esDomicilio ? (piso.trim() || null) : null,
      depto: esDomicilio ? (depto.trim() || null) : null,
      ciudad: esDomicilio ? ciudad.trim() : (ciudad.trim() || null),
      provincia_codigo: provincia as CodigoProvincia,
      codigo_postal: codigo_postal.trim(),
      tipo_envio: tarifa.productType,
      envio_a: tarifa.deliveredType,
      sucursal_id: !esDomicilio ? this.sucursalSeleccionadaId() : null,
      sucursal_nombre: !esDomicilio ? (this.sucursalSeleccionada()?.name ?? null) : null,
      peso_total_gr: Math.ceil(dimensiones.weight),
      alto_total_cm: Math.ceil(dimensiones.height),
      ancho_total_cm: Math.ceil(dimensiones.width),
      largo_total_cm: Math.ceil(dimensiones.length),
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
      const sucursalNombre = this.sucursalSeleccionada()?.name;
      const destino = tarifa.deliveredType === DeliveredType.D
        ? `a domicilio (${this.datosComprador.calle.trim()} ${this.datosComprador.numero.trim()}, ${this.datosComprador.ciudad.trim()}, CP ${this.datosComprador.codigo_postal.trim()})`
        : `a sucursal${sucursalNombre ? ` ${sucursalNombre}` : ''} (CP ${this.datosComprador.codigo_postal.trim()})`;
      mensaje += `📦 Correo Argentino ${servicio} ${destino}\n`;
    } else {
      mensaje += `🏪 Retiro en el local\n`;
    }

    const metodoPagoTexto = metodo === MetodoEntrega.ENVIO_CORREO_ARG
      ? (this.cartService.selectedPaymentMethod()?.nombre ?? MedioPago.TRANSFERENCIA)
      : (this.cartService.selectedPaymentMethod()?.nombre ?? 'A coordinar');

    mensaje += `💵 Medio de pago: *${metodoPagoTexto}*\n\n`;

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