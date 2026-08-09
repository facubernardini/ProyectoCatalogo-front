import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { CartItem } from 'src/app/core/models/cartItem.model';
import { MedioPago } from 'src/app/core/models/catalogo.model';
import { CuponVerificado } from 'src/app/core/models/cupon.model';
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { Producto } from 'src/app/core/models/producto.model';
import { CuponServiceBackend } from 'src/app/core/services-backend/cupones.ServiceBackend';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>(this.loadFromStorage());
  private cuponServiceBackend = inject(CuponServiceBackend);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  public loadingCupon = signal<boolean>(false);

  appliedCupon = signal<CuponVerificado | null>(null);
  selectedPaymentMethod = signal<MedioPago | null>(null);
  deliveryMethod = signal<'Envio' | 'Retiro' | null>(null);
  isOpen = signal(false);
  umbralMontoFaltanteEnvioGratis = 70;

  catalogConfig = signal<{ costoEnvio: number; envioGratisDesde: number; descuentoEfectivo: number } | null>(null);

  items = computed(() => this.cartItems());

  totalItems = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.cantidad, 0)
  );

  subtotalPrice = computed(() =>
    this.cartItems().reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
  );

  discountAmount = computed(() => {
    const cupon = this.appliedCupon();
    const subtotal = this.subtotalPrice();

    if (!cupon || subtotal === 0) return 0;

    if (cupon.es_porcentaje) {
      const baseDiscount = subtotal * (Number(cupon.descuento) / 100);
      return cupon.tope_descuento 
        ? Math.min(baseDiscount, Number(cupon.tope_descuento)) 
        : baseDiscount;
    }
    return Number(cupon.descuento);
  });

  isDiscountCapped = computed(() => {
    const cupon = this.appliedCupon();
    const subtotal = this.subtotalPrice();
    if (!cupon || !cupon.es_porcentaje || !cupon.tope_descuento) return false;

    const theoreticalDiscount = subtotal * (Number(cupon.descuento) / 100);
    return theoreticalDiscount >= Number(cupon.tope_descuento);
  });

  priceAfterCoupon = computed(() => {
    const final = this.subtotalPrice() - this.discountAmount();
    return final > 0 ? final : 0;
  });

  isCashPayment = computed(() => {
    const method = this.selectedPaymentMethod();
    if (!method) return false;
    
    return method.nombre.toLowerCase().includes('efectivo');
  });

  cashDiscountAmount = computed(() => {
    const config = this.catalogConfig();
    if (!config || !config.descuentoEfectivo || !this.isCashPayment()) return 0;
    
    const discount = this.priceAfterCoupon() * (config.descuentoEfectivo / 100);
    return Number(discount.toFixed(2));
  });

  priceAfterAllDiscounts = computed(() => {
    const final = this.priceAfterCoupon() - this.cashDiscountAmount();
    return final > 0 ? final : 0;
  });

  hasExtraCharges = computed(() => 
    this.deliveryMethod() === 'Envio' || 
    !!this.appliedCupon() || 
    this.cashDiscountAmount() > 0 || 
    this.discountAmount() > 0
  );

  // --- Lógica de Envío Gratis ---
  esEnvioGratis = computed(() => {
    const threshold = this.catalogConfig()?.envioGratisDesde;
    if (!threshold || threshold <= 0) return false;
    return this.priceAfterAllDiscounts() >= threshold;
  });

  faltanteEnvioGratis = computed(() => {
    const threshold = this.catalogConfig()?.envioGratisDesde ?? 0;
    return Math.max(0, threshold - this.priceAfterAllDiscounts());
  });

  porcentajeEnvioGratis = computed(() => {
    const threshold = this.catalogConfig()?.envioGratisDesde ?? 0;
    if (threshold <= 0) return 0;
    return Math.min(100, (this.priceAfterAllDiscounts() / threshold) * 100);
  });

  // --- TOTAL FINAL ---
  totalFinal = computed(() => {
    const base = this.priceAfterAllDiscounts();
    const config = this.catalogConfig();

    if (this.deliveryMethod() === 'Envio' && !this.esEnvioGratis() && config) {
      return base + config.costoEnvio;
    }
    return base;
  });

  constructor() {
    effect(() => {
      localStorage.setItem('cart_storage', JSON.stringify(this.cartItems()));
    });

    window.addEventListener('popstate', () => {
      if (this.isOpen() && history.state?.modal !== 'cart-modal') {
        this.cerrarInterno();
      }
    });
  }

  setCatalogConfig(costoEnvio: number, envioGratisDesde: number, descuentoEfectivo: number = 0) {
    this.catalogConfig.set({ costoEnvio, envioGratisDesde, descuentoEfectivo });
  }

  agregarProducto(producto: Producto, pres: Presentacion, cantidadAgregada: number = 1) {
    const precioEfectivo = pres.precio_descuento ?? pres.precio;

    this.cartItems.update((prev) => {
      const existe = prev.find((i) => i.presentacionId === pres.id);
      
      if (existe) {
        return prev.map((i) =>
          i.presentacionId === pres.id ? { ...i, cantidad: i.cantidad + cantidadAgregada } : i
        );
      }
      
      return [
        ...prev,
        {
          productoId: producto.id,
          presentacionId: pres.id,
          nombre: producto.nombre,
          unidad: pres.unidad_venta,
          precio: precioEfectivo,
          precio_base: Number(pres.precio),
          imagen: producto.imagen,
          cantidad: cantidadAgregada,
        },
      ];
    });
  }

  sumarUno(presentacionId: number) {
    this.cartItems.update((prev) =>
      prev.map((i) =>
        i.presentacionId === presentacionId ? { ...i, cantidad: i.cantidad + 1 } : i
      )
    );
  }

  restarUno(presentacionId: number) {
    this.cartItems.update((prev) =>
      prev.map((i) =>
        i.presentacionId === presentacionId ? { ...i, cantidad: i.cantidad - 1 } : i
      ).filter((i) => i.cantidad > 0)
    );
  }

  eliminarItem(presentacionId: number) {
    this.cartItems.update((prev) =>
      prev.filter((i) => i.presentacionId !== presentacionId)
    );
  }

  async limpiarCarrito(silent: boolean = false) {

    if (silent){
      if (this.cartItems().length > 0) {
        this.cartItems.set([]);
        this.selectedPaymentMethod.set(null);
        this.appliedCupon.set(null);
        this.deliveryMethod.set(null);

        this.close();
      }
    }
    else{
      const confirmacion = await this.confirmService.ask({
        title: '¿Está seguro?',
        message: '',
        confirmText: 'Sí, vaciar',
        cancelText: 'Cancelar',
        icon: 'trash',
        type: 'danger'
      });
  
      if (confirmacion) {
        if (this.cartItems().length > 0) {
          this.cartItems.set([]);
          this.selectedPaymentMethod.set(null);
          this.appliedCupon.set(null);
          this.deliveryMethod.set(null);
              
          this.toastService.show('Carrito vaciado con éxito 🗑️', 'success');
          
          this.close();
        }
      }
    }
  }

  aplicarCupon(codigo: string, catalogoId: number) {
    if (!codigo.trim()) return;
    
    this.loadingCupon.set(true);

    this.cuponServiceBackend.verificarCupon(codigo, catalogoId).subscribe({
      next: (res) => {
        this.appliedCupon.set(res);
        this.toastService.show(res.mensaje, 'success');
        this.loadingCupon.set(false);
      },
      error: (err) => {
        this.appliedCupon.set(null);
        this.toastService.show(err.error?.error || 'Cupón no válido', 'error');
        this.loadingCupon.set(false);
      },
    });
  }

  removerCupon() {
    this.appliedCupon.set(null);
  }

  private loadFromStorage(): CartItem[] {
    const data = localStorage.getItem('cart_storage');
    return data ? JSON.parse(data) : [];
  }

  selectPaymentMethod(method: MedioPago) {
    this.selectedPaymentMethod.set(method);
  }

  setDeliveryMethod(method: 'Envio' | 'Retiro') {
    this.deliveryMethod.set(method);
  }

  open() {
    if (this.isOpen()) return;

    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
    
    history.pushState({ modal: 'cart-modal' }, '');
  }

  close() {
    this.cerrarInterno();
    
    if (history.state?.modal === 'cart-modal') {
      history.back();
    }
  }

  private cerrarInterno() {
    if (!this.isOpen()) return;
    
    this.isOpen.set(false);
    document.body.style.overflow = 'auto';
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }
}