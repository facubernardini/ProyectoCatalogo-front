export interface Vendedor {
  id: number;
  nombre: string;
  correo: string;
  last_login?: Date | null;
  admin: boolean;
  catalogoId: number;
}

export interface RegistroVendedorRequest {
  nombre_apellido: string;
  correo: string;
  password: string;
}