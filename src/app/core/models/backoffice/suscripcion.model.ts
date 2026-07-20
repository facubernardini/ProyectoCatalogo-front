export enum SuscripcionEstado {
    ACTIVA = 'ACTIVA',
    PENDIENTE_PAGO = 'PENDIENTE_PAGO',
    CANCELADA = 'CANCELADA',
}

export enum SuscripcionAccion {
    ALTA = 'ALTA',
    UPGRADE = 'UPGRADE',
    DOWNGRADE = 'DOWNGRADE',
    RENOVACION = 'RENOVACION',
    CANCELACION = 'CANCELACION'
}

// Enum local solo en el front
export enum TipoPlan {
    PRUEBA = 'PRUEBA',
    BASE = 'BASE',
    PREMIUM = 'PREMIUM',
    SIN_PLAN = 'SIN_PLAN',
    CUSTOM = 'CUSTOM'
}

export interface PlanSuscripcion {
    id: number;
    tipo_plan: string;
}

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