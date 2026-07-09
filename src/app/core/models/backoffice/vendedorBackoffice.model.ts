import { Suscripcion } from "./suscripcion.model";

export interface VendedorBackoffice {
    id: number;
    nombre_apellido: string;
    correo: string;
    activo: boolean;
    creado_el: Date;
    actualizado_el: Date;
    ultimo_ingreso: Date | null;
    suscripcion: Suscripcion | null;
}