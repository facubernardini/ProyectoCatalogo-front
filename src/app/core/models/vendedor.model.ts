import { Suscripcion } from "./backoffice/suscripcion.model";

export interface Vendedor {
  id: number;
  nombre_apellido: string;
  correo: string;
  fecha_registro: Date;
  admin: boolean;
  catalogoId: number;

  suscripcion: Suscripcion | null;
}

export interface RegistroVendedorRequest {
  nombre_apellido: string;
  correo: string;
  password: string;
}