export interface Presentacion {
  id: number;
  unidad_venta: string;
  precio: number;
  stock: number;
  precio_descuento: number | null;
}