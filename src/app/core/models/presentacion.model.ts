export interface Presentacion {
  id: number;
  producto_id: number;
  unidad_venta: string;

  sku: string | null;
  talle: string | null;
  color_nombre: string | null;
  color_hex: string | null;

  precio: number;
  precio_costo: number | null;
  stock: number | null;
  precio_descuento: number | null;
  activo: boolean;
}

export interface PresentacionForm {
  unidad_venta: string;
  precio: number | null;
  precio_descuento: number | null;
  precio_costo: number | null;
  stock: number | null;
  activo: boolean;
}