import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface ColorVariante {
  nombre: string;
  hex: string;
}

export interface PresentacionUI {
  id_temporal: string;
  unidad_venta: string;
  sku: string | null;
  talle: string | null;
  color_nombre: string | null;
  color_hex: string | null;
  precio: number;
  stock: number | null;
  activo: boolean;
}

@Component({
  selector: 'app-variantes-indumentaria',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './variantes-indumentaria.html'
})
export class VariantesIndumentaria {
  @Input() variantesIniciales: any[] = [];

  @Output() variantesActualizadas = new EventEmitter<PresentacionUI[]>();
  @Output() coloresActualizados = new EventEmitter<ColorVariante[]>();

  precioBase: number | null = 0;

  // Signals para manejar el estado local
  talles = signal<string[]>([]);
  colores = signal<ColorVariante[]>([]);
  variantes = signal<PresentacionUI[]>([]);

  // Variables para los inputs (NgModel)
  nuevoTalle: string = '';
  nuevoColorNombre: string = '';
  nuevoColorHex: string = '#ff0000';

  ngOnInit() {
    if (this.variantesIniciales && this.variantesIniciales.length > 0) {
      
      // 1. Extraemos los talles únicos
      const tallesUnicos = [...new Set(this.variantesIniciales.map(v => v.talle).filter(t => t !== null))];
      this.talles.set(tallesUnicos as string[]);

      // 2. Extraemos los colores únicos
      const coloresMap = new Map();
      this.variantesIniciales.forEach(v => {
        if (v.color_nombre && !coloresMap.has(v.color_nombre)) {
          coloresMap.set(v.color_nombre, { nombre: v.color_nombre, hex: v.color_hex });
        }
      });
      const coloresExtraidos = Array.from(coloresMap.values());
      this.colores.set(coloresExtraidos);

      // 3. Emitimos los colores para que la Galería de Imágenes se entere inmediatamente
      this.coloresActualizados.emit(coloresExtraidos);

      // 4. Cargamos la tabla con los datos reales
      // Mapeamos asegurando que exista un id_temporal para el ngFor
      const variantesCargadas = this.variantesIniciales.map(v => ({
        ...v,
        id_temporal: v.id_temporal || Math.random().toString(36).substring(2, 9),
        precio: Number(v.precio)
      }));
      
      this.variantes.set(variantesCargadas);
      
      this.precioBase = variantesCargadas[0]?.precio || 0;
      
      this.variantesActualizadas.emit(this.variantes());
    }
  }

  // --- LÓGICA DE TALLES ---
  agregarTalle() {
    const valor = this.nuevoTalle.trim().toUpperCase();
    if (!valor) return;

    // Lógica para rangos (Ej: 38-42)
    if (valor.includes('-')) {
      const [min, max] = valor.split('-').map(n => parseInt(n));
      if (!isNaN(min) && !isNaN(max) && min < max && max - min < 20) {
        const nuevos = Array.from({length: max - min + 1}, (_, i) => (min + i).toString());
        this.talles.update(t => [...new Set([...t, ...nuevos])]);
      }
    } else if (!this.talles().includes(valor)) {
      this.talles.update(t => [...t, valor]);
    }
    
    this.nuevoTalle = '';
    this.generarMatriz();
  }

  eliminarTalle(talle: string) {
    this.talles.update(t => t.filter(x => x !== talle));
    this.generarMatriz();
  }

  // --- LÓGICA DE COLORES ---
  agregarColor() {
    const nombre = this.nuevoColorNombre.trim();
    if (!nombre || this.colores().find(c => c.nombre.toLowerCase() === nombre.toLowerCase())) return;

    this.colores.update(c => [...c, { nombre, hex: this.nuevoColorHex }]);
    
    this.nuevoColorNombre = '';
    this.nuevoColorHex = '#000000';
    this.generarMatriz();
    this.coloresActualizados.emit(this.colores());
  }

  eliminarColor(nombre: string) {
    this.colores.update(c => c.filter(x => x.nombre !== nombre));
    this.generarMatriz();
    this.coloresActualizados.emit(this.colores());
  }

  // --- GENERACIÓN DE MATRIZ ---
  generarMatriz() {
    const nuevasVariantes: PresentacionUI[] = [];
    
    const tallesIterables = this.talles().length > 0 ? this.talles() : [null];
    const coloresIterables = this.colores().length > 0 ? this.colores() : [null];

    tallesIterables.forEach(talle => {
      coloresIterables.forEach(color => {
        
        // 1. Buscamos si esta variante ya existía para no borrarle el precio/stock/sku al vendedor
        const existente = this.variantes().find(v => 
          v.talle === talle && v.color_nombre === (color ? color.nombre : null)
        );

        if (existente) {
          nuevasVariantes.push(existente);
        } else {
          // 2. Si es nueva, la creamos
          nuevasVariantes.push({
            id_temporal: Math.random().toString(36).substring(2, 9),
            unidad_venta: this.generarUnidadVenta(talle, color?.nombre || null),
            sku: null,
            talle: talle,
            color_nombre: color?.nombre || null,
            color_hex: color?.hex || null,
            precio: this.precioBase || 0,
            stock: null,
            activo: true
          });
        }
      });
    });

    // Filtramos el caso donde no hay ni talles ni colores (limpiamos la tabla)
    if (this.talles().length === 0 && this.colores().length === 0) {
      this.variantes.set([]);
    } else {
      this.variantes.set(nuevasVariantes);
    }
    
    this.variantesActualizadas.emit(this.variantes());
  }

  sincronizarPrecios() {    
    // Validamos que el precio sea válido
    if (this.precioBase === null || this.precioBase < 0) return;

    this.variantes.update(vars => {
      return vars.map(v => ({
        ...v,
        precio: this.precioBase || 0,
      }));
    });
    
    this.notificarCambioTabla();
  }

  generarUnidadVenta(talle: string | null, color: string | null): string {
    if (talle && color) return `${color} - ${talle}`;
    if (talle) return `Talle ${talle}`;
    if (color) return color;
    return 'Unidad';
  }

  notificarCambioTabla() {
    this.variantesActualizadas.emit(this.variantes());
  }
}