export enum MetodoEntrega {
    RETIRO = 'Retiro',
    ENVIO = 'Envio',
}

export const METODO_ENTREGA_ICONS: Record<MetodoEntrega, string> = {
    [MetodoEntrega.ENVIO]: 'delivery',
    [MetodoEntrega.RETIRO]: 'shop',
};