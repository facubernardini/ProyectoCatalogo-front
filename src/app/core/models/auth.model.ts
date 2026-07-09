import { Vendedor } from "./vendedor.model";

export interface LoginResponse {
  message: string;
  token: string;
  vendedor: Vendedor;
}