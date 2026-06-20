export enum TemaCatalogo {
  MIDNIGHT = 'MIDNIGHT',
  SUNSET = 'SUNSET',
  ZAFIRO = 'ZAFIRO',
  FOREST = 'FOREST',
  SAKURA = 'SAKURA',
  MATCHA = 'MATCHA',
  LAVANDA = 'LAVANDA',
  MINIMAL = 'MINIMAL',
  TERRACOTA = 'TERRACOTA',
  AQUA = 'AQUA'
}

export interface MedioPago {
  id: number;
  nombre: string;
  icono: string | null;
}

export interface HorarioDia {
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  abierto: boolean;
  apertura: string;
  cierre: string;
}

export interface Rubro {
  id: number;
  nombre: string;
}

export interface RespuestaSlug {
  disponible: boolean;
  slugVerificado: string;
}

export interface Catalogo {
  id: number;
  nombre_tienda: string;
  frase_eslogan: string | null;
  slug: string;
  rubro_id: number;
  logo_tienda: string;
  tema: TemaCatalogo;
  wpp_numero: string | null;
  instagram_usuario: string | null;
  
  direccion: string | null;
  ciudad: string | null;

  minimo_compra: number;
  ofrece_envio: boolean;
  costo_envio: number | null;
  envio_gratis_desde: number | null;
  
  descuento_en_efectivo: number;

  horarios: HorarioDia[];
  
  medios_pago: MedioPago[];
}