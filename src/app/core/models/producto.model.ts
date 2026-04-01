import { Presentacion } from "./presentacion.model";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
  destacado: boolean;
  tag_evento: string | null;
  activo: boolean;
  
  presentaciones: Presentacion[];
}