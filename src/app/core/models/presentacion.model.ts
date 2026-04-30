export interface Presentacion {
  id: number;
  producto_id: number;
  unidad_venta: string;
  precio: number;
  stock: number;
  precio_descuento: number | null;
  activo: boolean;
}