export interface CategoriaVendedor {
  id: number;
  nombre: string;
  catalogo_id: number;
  productos_count: number;
  activo: boolean;
  especial: boolean;
}

export interface CategoriaMinimal {
  id: number;
  nombre: string;
}