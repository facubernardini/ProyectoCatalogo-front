export interface MedioPago {
  id: number;
  nombre: string;
  icono: string;
}

export interface Catalogo {
  id: number;
  nombre_tienda: string;
  slug: string;
  minimo_compra: number;
  wpp_numero: string | null;
  instagram_usuario: string | null;
  ofrece_envio: boolean;
  costo_envio: number;
  medios_pago: MedioPago[];
}