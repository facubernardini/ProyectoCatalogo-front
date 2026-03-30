export interface Vendedor {
  id: number;
  nombre: string;
  admin: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  vendedor: Vendedor;
}