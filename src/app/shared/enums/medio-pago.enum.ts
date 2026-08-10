export enum MedioPago {
    EFECTIVO = 'Efectivo',
    TRANSFERENCIA = 'Transferencia',
    CUENTA_DNI = 'Cuenta DNI',
    MERCADO_PAGO = 'Mercado Pago',
}

export const MEDIO_PAGO_ICONS: Record<MedioPago, string> = {
    [MedioPago.EFECTIVO]: 'payment-efectivo',
    [MedioPago.TRANSFERENCIA]: 'payment-transferencia',
    [MedioPago.CUENTA_DNI]: 'payment-cuenta-dni',
    [MedioPago.MERCADO_PAGO]: 'payment-mercado-pago',
};