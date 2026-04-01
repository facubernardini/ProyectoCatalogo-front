import { Catalogo } from "./catalogo.model";

export interface Vendedor {
  id: number;
  nombre: string;
  correo: string;
  admin: boolean;
  catalogo?: Catalogo | null;
}