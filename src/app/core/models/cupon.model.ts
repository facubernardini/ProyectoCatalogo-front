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
    codigo_cupon: string;
    descuento: number;
    es_porcentaje: boolean;
    tope_descuento: number | null; 
    fecha_expiracion: string | null; 
    usos_actuales: number;
    limite_usos: number | null; 
    activo: boolean;
}