import { Presentacion } from "./presentacion.model";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
  destacado: boolean;
  activo: boolean;
  catalogo_id: number;
  
  presentaciones: Presentacion[];
  categorias: any[];
}