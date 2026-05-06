export interface CuponVerificado {
    id: number;
    codigo: string,
    descuento: number;
    es_porcentaje: boolean;
    tope_descuento: number;
    mensaje: string;
}

export interface Cupon {
    id: number;
    codigo: string,
    descuento: number;
    es_porcentaje: boolean;
    tope_descuento: number;
    fecha_expiracion: number;
    usos_actuales: number;
    limite_usos: number;
    activo: boolean;
}