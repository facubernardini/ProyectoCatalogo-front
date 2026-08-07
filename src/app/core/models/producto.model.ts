import { Presentacion } from "./presentacion.model";

export interface CategoriaSimplificada {
  id: number;
  nombre: string;
}

export interface Tag {
  id: number;
  rubro_id: number;
  nombre: string;
  icono: string;
}

export interface Producto {
  id: number;
  nombre: string;
  marca: string | null;
  descripcion: string | null;
  imagen: string | null;
  destacado: boolean;
  activo: boolean;
  
  presentaciones: Presentacion[];
  
  categorias: CategoriaSimplificada[];
  tags: Tag[];
}