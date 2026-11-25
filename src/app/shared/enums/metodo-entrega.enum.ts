export enum MetodoEntrega {
    RETIRO = 'Retiro',
    ENVIO_LOCAL = 'Envío Local',
    ENVIO_CORREO_ARG = 'Envío Correo Argentino',
}

export const METODO_ENTREGA_ICONS: Record<MetodoEntrega, string> = {
    [MetodoEntrega.ENVIO_LOCAL]: 'delivery',
    [MetodoEntrega.ENVIO_CORREO_ARG]: 'delivery-truck',
    [MetodoEntrega.RETIRO]: 'shop',
};