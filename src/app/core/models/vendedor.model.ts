import { Catalogo } from "./catalogo.model";

export interface Vendedor {
  id: number;
  nombre: string;
  correo: string;
  admin: boolean;
  catalogo?: Catalogo | null;
}

export interface RegistroVendedorRequest {
  nombre_apellido: string;
  correo: string;
  password: string;
}