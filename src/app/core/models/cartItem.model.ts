export interface CartItem {
  productoId: number;
  presentacionId: number;
  nombre: string;
  unidad: string;
  precio: number;
  cantidad: number;
  imagen: string | null;
}