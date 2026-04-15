import { Presentacion } from "./presentacion.model";

export interface CategoriaSimplificada {
  id: number;
  nombre: string;
}

export interface Tag {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
  destacado: boolean;
  activo: boolean;
  catalogo_id: number;
  
  presentaciones: Presentacion[];
  
  categorias: CategoriaSimplificada[];
  tags: Tag[];
}