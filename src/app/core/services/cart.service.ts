import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Producto } from '../models/producto.model';
import { CartItem } from '../models/cartItem.model';
import { Presentacion } from '../models/presentacion.model';
import { MedioPago } from '../models/catalogo.model';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>(this.loadFromStorage());
  
  selectedPaymentMethod = signal<MedioPago | null>(null);

  private toastService = inject(ToastService);

  isOpen = signal(false);

  items = computed(() => this.cartItems());
  
  totalItems = computed(() => 
    this.cartItems().reduce((acc, item) => acc + item.cantidad, 0)
  );

  totalPrice = computed(() => 
    this.cartItems().reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
  );

  constructor() {
    effect(() => {
      localStorage.setItem('cart_storage', JSON.stringify(this.cartItems()));
    });
  }

  agregarProducto(producto: Producto, pres: Presentacion) {
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
        precio: pres.precio,
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
      this.toastService.show('Carrito vaciado con éxito 🗑️', 'success');
    }
  }

  private loadFromStorage(): CartItem[] {
    const data = localStorage.getItem('cart_storage');
    return data ? JSON.parse(data) : [];
  }

  selectPaymentMethod(method: MedioPago) {
    this.selectedPaymentMethod.set(method);
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