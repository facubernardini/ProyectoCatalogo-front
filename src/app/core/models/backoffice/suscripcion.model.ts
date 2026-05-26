export type SuscripcionEstado = 'ACTIVA' | 'PENDIENTE_PAGO' | 'CANCELADA';

export interface Suscripcion {
    id: number;
    plan: string; 
    estado: SuscripcionEstado;
    fecha_inicio: Date;
    fecha_fin: Date | null;
}