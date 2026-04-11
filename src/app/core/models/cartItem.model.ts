export interface CartItem {
  productoId: number;
  presentacionId: number;
  nombre: string;
  unidad: string;
  precio: number;
  precio_base: number;
  cantidad: number;
  imagen: string | null;
}