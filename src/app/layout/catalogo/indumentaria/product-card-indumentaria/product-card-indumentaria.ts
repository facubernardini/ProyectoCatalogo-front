import { Component, computed, inject, input, signal } from '@angular/core';
import { Producto } from 'src/app/core/models/producto.model';
import { Icon } from "@shared/components/icon";
import { Presentacion } from 'src/app/core/models/presentacion.model';
import { CommonModule } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card-indumentaria',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './product-card-indumentaria.html',
})
export class ProductCardIndumentaria {
  public adminStore = inject(AdminStoreService);
  private router = inject(Router);

  producto = input.required<Producto>();

  public imageLoaded = signal(false);

  portada = computed(() => {
    const prod = this.producto();
    
    if (prod.imagenes && prod.imagenes.length > 0) {
      const general = prod.imagenes.find((img: any) => img.color_asociado === null);
      return general ? general.url : prod.imagenes[0].url;
    }
    
    return prod.imagen;
  });

  estaAgotado = computed(() => this.presentacionesDisponibles().length === 0);

  presentacionesDisponibles = computed(() => {
    const prod = this.producto();
    const permiteVentaSinStock = this.adminStore.catalogo()?.permitir_ventas_sin_stock ?? false;
    
    if (permiteVentaSinStock) {
      return prod.presentaciones;
    }

    return prod.presentaciones.filter(p => p.stock === null || p.stock > 0);
  });

  tallesDisponibles = computed(() => {
    const presentaciones = this.presentacionesDisponibles();
    const talles = presentaciones
      .map(p => p.talle)
      .filter((t): t is string => t !== null && t !== undefined);
    
    return [...new Set(talles)];
  });

  // Extraemos los colores únicos disponibles
  coloresDisponibles = computed(() => {
    const presentaciones = this.presentacionesDisponibles();
    const colores = new Map<string, { nombre: string, hex: string }>();
    
    presentaciones.forEach(p => {
      if (p.color_nombre && p.color_hex && !colores.has(p.color_nombre)) {
        colores.set(p.color_nombre, { nombre: p.color_nombre, hex: p.color_hex });
      }
    });
    
    return Array.from(colores.values());
  });

  mejorOferta = computed(() => this.getMejorOferta(this.presentacionesDisponibles()));

  navegarAlDetalle() {
    const prod = this.producto();
        
    const prodSlug = this.crearSlug(prod.nombre);

    this.router.navigate(['/productos', prodSlug]);
  }

  private crearSlug(texto: string): string {
    return texto
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  getMejorOferta(presentaciones: Presentacion[]): Presentacion | null {
    if (!presentaciones?.length) return null;

    return presentaciones.reduce((prev, curr) => {
      const precioPrev = prev.precio_descuento ?? prev.precio;
      const precioCurr = curr.precio_descuento ?? curr.precio;
      
      return Number(precioCurr) < Number(precioPrev) ? curr : prev;
    });
  }

  calcularPrecioEfectivo(precioActual: number): number {
    const descuentoPorcentaje = this.adminStore.catalogo()?.descuento_en_efectivo || 0;
    
    if (descuentoPorcentaje <= 0) return precioActual;
    
    const descuento = (precioActual * descuentoPorcentaje) / 100;
    return precioActual - descuento;
  }

  calcularPorcentajeOff(precio: number, precioDescuento: number): number {
    if (!precio || !precioDescuento) return 0;
    return Math.round(((precio - precioDescuento) / precio) * 100);
  }

  onImageLoad() {
    this.imageLoaded.set(true);
  }
}