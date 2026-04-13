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

  appliedCupon = signal<CuponVerificado | null>(null);
  
  selectedPaymentMethod = signal<MedioPago | null>(null);

  deliveryMethod = signal<'envio' | 'retiro' | null>(null);
  isOpen = signal(false);
  
  items = computed(() => this.cartItems());
  
  totalItems = computed(() => 
    this.cartItems().reduce((acc, item) => acc + item.cantidad, 0)
  );
  
  subtotalPrice = computed(() => 
    this.cartItems().reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
  );

  // Cálculo del descuento basado en el cupón
  discountAmount = computed(() => {
    const cupon = this.appliedCupon();
    const subtotal = this.subtotalPrice();
    
    if (!cupon || subtotal === 0) return 0;

    if (cupon.es_porcentaje) {
      return subtotal * (cupon.descuento / 100);
    } else {
      return cupon.descuento;
    }
  });

  // Precio final que el usuario realmente paga
  totalPrice = computed(() => {
    const final = this.subtotalPrice() - this.discountAmount();
    return final > 0 ? final : 0;
  });

  constructor() {
    effect(() => {
      localStorage.setItem('cart_storage', JSON.stringify(this.cartItems()));
    });
  }

  agregarProducto(producto: Producto, pres: Presentacion) {
    const precioEfectivo = pres.precio_descuento ?? pres.precio;
    
    this.cartItems.update(prev => {
      const existe = prev.find(i => i.presentacionId === pres.id);

      if (existe) {
        return prev.map(i => 
          i.presentacionId === pres.id 
            ? { ...i, cantidad: i.cantidad + 1 } 
            : i
        );
      }

      const nuevoItem: CartItem = {
        productoId: producto.id,
        presentacionId: pres.id,
        nombre: producto.nombre,
        unidad: pres.unidad_venta,
        precio: precioEfectivo,
        precio_base: Number(pres.precio),
        imagen: producto.imagen,
        cantidad: 1
      };
      return [...prev, nuevoItem];
    });

    this.toastService.show(`${producto.nombre} agregado al carrito 🛒`);
  }

  sumarUno(presentacionId: number) {
    this.cartItems.update(prev => 
        prev.map(i => i.presentacionId === presentacionId 
        ? { ...i, cantidad: i.cantidad + 1 } 
        : i
        )
    );
    }

  restarUno(presentacionId: number) {
    this.cartItems.update(prev => 
      prev.map(i => i.presentacionId === presentacionId 
        ? { ...i, cantidad: i.cantidad - 1 } 
        : i
      ).filter(i => i.cantidad > 0)
    );
  }

  eliminarItem(presentacionId: number) {
    this.cartItems.update(prev => prev.filter(i => i.presentacionId !== presentacionId));
  }

  limpiarCarrito() {
    if (this.cartItems().length > 0){
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
        this.toastService.show(`Cupón "${codigo}" aplicado con éxito ✅`, 'success');
      },
      error: (err) => {
        this.appliedCupon.set(null);
        const errorMsg = err.error?.error || 'Cupón no válido';
        this.toastService.show(errorMsg, 'error');
      }
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
  
  toggle() { this.isOpen.update(v => !v); }
}