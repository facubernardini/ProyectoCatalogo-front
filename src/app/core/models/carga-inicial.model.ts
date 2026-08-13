export interface PresentacionImportada {
  unidad_venta: string;
  precio: number;
}

export interface ProductoImportado {
  nombre: string;
  descripcion?: string;
  marca?: string;
  categoria: string;
  foto_url?: string;
  presentaciones: PresentacionImportada[];
}