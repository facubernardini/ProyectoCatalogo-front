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

// Interfaz para catalogo publico
export interface CategoriaViewData {
  nombre: string;
  es_agrupadora: boolean;
  nombres_hijas?: string[];
}