export interface MedioPago {
  id: number;
  nombre: string;
  icono: string | null;
}

export interface HorarioSemana {
  dia: string;
  horas: string;
}

export interface Catalogo {
  id: number;
  nombre_tienda: string;
  slug: string;
  logo_tienda: string;
  wpp_numero: string | null;
  instagram_usuario: string | null;
  
  direccion: string | null;
  ciudad: string | null;

  minimo_compra: number;
  ofrece_envio: boolean;
  costo_envio: number | null;
  envio_gratis_desde: number | null;

  horarios: HorarioSemana[];
  
  medios_pago: MedioPago[];
}