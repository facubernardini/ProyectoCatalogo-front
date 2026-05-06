import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Producto } from '../models/producto.model';
import { CartItem } from '../models/cartItem.model';
import { Presentacion } from '../models/presentacion.model';
import { MedioPago } from '../models/catalogo.model';
import { ToastService } from './toast.service';
import { CuponServiceBackend } from '../services-backend/cupones.ServiceBackend';
import { CuponVerificado } from '../models/cupon.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>(this.loadFromStorage());
  private cuponServiceBackend = inject(CuponServiceBackend);
  private toastService = inject(ToastService);

  // --- Estado del Carrito ---
  appliedCupon = signal<CuponVerificado | null>(null);
  selectedPaymentMethod = signal<MedioPago | null>(null);
  deliveryMethod = signal<'envio' | 'retiro' | null>(null);
  isOpen = signal(false);

  // Nueva signal para la configuración dinámica del catálogo
  catalogConfig = signal<{ costoEnvio: number; envioGratisDesde: number } | null>(null);

  items = computed(() => this.cartItems());

  totalItems = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.cantidad, 0)
  );

  // Suma bruta de productos
  subtotalPrice = computed(() =>
    this.cartItems().reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
  );

  // Valor del descuento aplicado
  discountAmount = computed(() => {
    const cupon = this.appliedCupon();
    const subtotal = this.subtotalPrice();

    if (!cupon || subtotal === 0) return 0;

    if (cupon.es_porcentaje) {
      // Calculamos el descuento base por porcentaje
      const baseDiscount = subtotal * (Number(cupon.descuento) / 100);

      // Si tiene tope, aplicamos el menor entre el cálculo y el tope
      return cupon.tope_descuento 
        ? Math.min(baseDiscount, Number(cupon.tope_descuento)) 
        : baseDiscount;
    }

    // Si no es porcentaje, es monto fijo
    return Number(cupon.descuento);
  });

  isDiscountCapped = computed(() => {
    const cupon = this.appliedCupon();
    const subtotal = this.subtotalPrice();
    
    if (!cupon || !cupon.es_porcentaje || !cupon.tope_descuento) return false;

    const theoreticalDiscount = subtotal * (Number(cupon.descuento) / 100);
    return theoreticalDiscount >= Number(cupon.tope_descuento);
  });

  // Precio después de cupones (pero antes de envío)
  priceAfterDiscount = computed(() => {
    const final = this.subtotalPrice() - this.discountAmount();
    return final > 0 ? final : 0;
  });

  // --- Lógica de Envío Gratis ---
  esEnvioGratis = computed(() => {
    const threshold = this.catalogConfig()?.envioGratisDesde;
    if (!threshold || threshold <= 0) return false;
    // Comparamos contra el precio con descuento aplicado
    return this.priceAfterDiscount() >= threshold;
  });

  faltanteEnvioGratis = computed(() => {
    const threshold = this.catalogConfig()?.envioGratisDesde ?? 0;
    return Math.max(0, threshold - this.priceAfterDiscount());
  });

  porcentajeEnvioGratis = computed(() => {
    const threshold = this.catalogConfig()?.envioGratisDesde ?? 0;
    if (threshold <= 0) return 0;
    return Math.min(100, (this.priceAfterDiscount() / threshold) * 100);
  });

  // --- TOTAL FINAL ---
  totalFinal = computed(() => {
    const base = this.priceAfterDiscount();
    const config = this.catalogConfig();

    if (this.deliveryMethod() === 'envio' && !this.esEnvioGratis() && config) {
      return base + config.costoEnvio;
    }
    return base;
  });

  constructor() {
    effect(() => {
      localStorage.setItem('cart_storage', JSON.stringify(this.cartItems()));
    });
  }

  // --- Métodos de Acción ---
  setCatalogConfig(costoEnvio: number, envioGratisDesde: number) {
    this.catalogConfig.set({ costoEnvio, envioGratisDesde });
  }

  agregarProducto(producto: Producto, pres: Presentacion) {
    const precioEfectivo = pres.precio_descuento ?? pres.precio;

    this.cartItems.update((prev) => {
      const existe = prev.find((i) => i.presentacionId === pres.id);
      if (existe) {
        return prev.map((i) =>
          i.presentacionId === pres.id ? { ...i, cantidad: i.cantidad + 1 } : i
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
          cantidad: 1,
        },
      ];
    });
    this.toastService.show(`${producto.nombre} agregado al carrito 🛒`);
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

  limpiarCarrito() {
    if (this.cartItems().length > 0) {
      this.cartItems.set([]);
      this.selectedPaymentMethod.set(null);
      this.appliedCupon.set(null);
      this.deliveryMethod.set(null);
      this.toastService.show('Carrito vaciado con éxito 🗑️', 'success');
    }
  }

  aplicarCupon(codigo: string, catalogoId: number) {
    if (!codigo.trim()) return;
    this.cuponServiceBackend.verificarCupon(codigo, catalogoId).subscribe({
      next: (res) => {
        this.appliedCupon.set(res);
        this.toastService.show(`Cupón "${codigo}" aplicado ✅`, 'success');
      },
      error: (err) => {
        this.appliedCupon.set(null);
        this.toastService.show(err.error?.error || 'Cupón no válido', 'error');
      },
    });
  }

  removerCupon() {
    this.appliedCupon.set(null);
    this.toastService.show('Cupón removido');
  }

  private loadFromStorage(): CartItem[] {
    const data = localStorage.getItem('cart_storage');
    return data ? JSON.parse(data) : [];
  }

  selectPaymentMethod(method: MedioPago) {
    this.selectedPaymentMethod.set(method);
  }

  setDeliveryMethod(method: 'envio' | 'retiro') {
    this.deliveryMethod.set(method);
  }

  open() {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    document.body.style.overflow = 'auto';
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }
}