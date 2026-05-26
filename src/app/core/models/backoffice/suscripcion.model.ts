export type SuscripcionEstado = 'ACTIVA' | 'PENDIENTE_PAGO' | 'CANCELADA';
export type SuscripcionAccion = 'ALTA' | 'UPGRADE' | 'RENOVACION' | 'CANCELACION';

export interface Suscripcion {
    id: number;
    plan: string; 
    estado: SuscripcionEstado;
    fecha_inicio: Date;
    fecha_fin: Date | null;
}

export interface HistorialSuscripcion {
    id: number;
    
    vendedor_id: number;
    vendedor_nombre: string;
    plan: string;
    
    accion: SuscripcionAccion;
    precio_pagado: number;
    
    fecha_inicio: Date;
    fecha_fin: Date | null;
    registrado_el: Date;
}