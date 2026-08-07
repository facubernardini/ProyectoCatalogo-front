export interface Presentacion {
  id: number;
  producto_id: number;
  unidad_venta: string;
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