export interface CategoriaVendedor {
  id: number;
  nombre: string;
  catalogo_id: number;
  productos_count: number;
  imagen: string | null;
  activo: boolean;
  especial: boolean;

  parent_id: number | null;
  es_agrupadora: boolean;
  subcategorias?: CategoriaVendedor[];
}

export interface CategoriaMinimal {
  id: number;
  nombre: string;
  //parent_id?: number | null; ver!
  //es_agrupadora?: boolean; ver!
}