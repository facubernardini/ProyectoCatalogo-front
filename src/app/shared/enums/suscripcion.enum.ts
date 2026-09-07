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