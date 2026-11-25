import { CodigoProvincia, DeliveredType, ProductType } from "src/app/shared/enums/correo-argentino.enum";
import { MetodoEntrega } from "src/app/shared/enums/metodo-entrega.enum";

export enum EstadoPedido {
    PENDIENTE = 'PENDIENTE',
    EN_PREPARACION = 'EN_PREPARACION',
    LISTO_PARA_ENTREGAR = 'LISTO_PARA_ENTREGAR',
    DESPACHADO = 'DESPACHADO',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO'
}

export enum EstadoPago {
    PENDIENTE = 'PENDIENTE',
    PAGADO = 'PAGADO',
    REEMBOLSADO = 'REEMBOLSADO',
}

// --- MOSTRAR PEDIDOS EN EL PANEL DEL VENDEDOR
export interface ProductoPedidoDTO {
    id: string;

    pedido_id: string;
    producto_id: number;
    presentacion_id: number;

    producto_nombre: string;
    presentacion_unidad: string;

    sku_comprado: string | null;
    talle_comprado: string | null;
    color_comprado: string | null;
    
    precio_unitario: number;
    precio_costo_unitario: number | null;
    
    cantidad: number;
    subtotal: number;
    subtotal_costo: number | null;
    imagen: string | null;
}

export interface PedidoDTO {
    id: string;
    catalogo_id: number;
    numero_pedido: number;
    estado: EstadoPedido;
    estado_pago: EstadoPago;
    
    comprador_nombre: string | null;
    comprador_direccion: string | null;
    comprador_telefono: string | null;
    metodo_entrega: MetodoEntrega;
    envio_a_coordinar: boolean;
    metodo_pago: string;
    costo_envio: number;
    
    subtotal: number;
    cupon_codigo: string | null;
    cupon_descuento: number | null;
    cupon_es_porcentaje: boolean | null;
    descuento_cupon: number;
    descuento_pago_efectivo: number;
    total_final: number;

    costo_total: number | null;
    ganancia_total: number | null;
    
    creado_el: string;
    actualizado_el: string;
    
    productos: ProductoPedidoDTO[];
    detalle_envio: DetalleEnvioDTO | null;
}

export interface DetalleEnvioDTO {
    id: string;
    envio_a: DeliveredType;
    tipo_envio: ProductType;
    sucursal_id: string | null;
    sucursal_nombre: string | null;
    tracking_number: string | null;
    importado_el: string | null;

    destinatario_email: string;
    calle: string | null;
    numero: string | null;
    piso: string | null;
    depto: string | null;
    ciudad: string;
    provincia_codigo: CodigoProvincia;
    codigo_postal: string;

    peso_total_gr: number | null;
    alto_total_cm: number | null;
    ancho_total_cm: number | null;
    largo_total_cm: number | null;
}

// --- REGISTRAR PEDIDO DESDE TIENDA PÚBLICA ---
export interface ProductoPedidoRequest {
    producto_id: number;
    presentacion_id: number;
    cantidad: number;
}

export interface CrearPedidoRequest {
    catalogo_id: number;

    comprador_nombre?: string | null;
    comprador_direccion?: string | null;
    comprador_telefono?: string | null;

    metodo_entrega: MetodoEntrega;
    envio_a_coordinar: boolean;
    metodo_pago: string;
    costo_envio?: number;
    cupon_codigo?: string | null;

    estado?: EstadoPedido; 
    estado_pago?: EstadoPago;

    productos: ProductoPedidoRequest[];

    detalle_envio?: DetalleEnvioRequest | null;
}

export interface DetalleEnvioRequest {
    destinatario_email: string;
    calle?: string | null;
    numero?: string | null;
    piso?: string | null;
    depto?: string | null;
    ciudad?: string | null;
    provincia_codigo: CodigoProvincia;
    codigo_postal: string;
    
    tipo_envio: ProductType; // Clásico o Expreso
    envio_a: DeliveredType;  // Domicilio o Sucursal
    sucursal_id?: string | null;
    sucursal_nombre?: string | null;

    peso_total_gr: number;
    alto_total_cm: number;
    ancho_total_cm: number;
    largo_total_cm: number;
}

// --- RESPUESTA DEL BACK AL REGISTRAR EL PEDIDO PÚBLICO ---
export interface PedidoResponse {
    id: string;
    numero_pedido: number;
}

// --- REGISTRAR PEDIDO MANUAL ---
export interface ProductoPedidoForm extends ProductoPedidoRequest {
    producto_nombre: string;
    presentacion_unidad: string;
    precio_unitario: number;
    imagen: string | null;
}

export interface PedidoFormData extends Omit<CrearPedidoRequest, 'catalogo_id' | 'productos'> {
    comprador_direccion: string;
    comprador_telefono: string;
    productos: ProductoPedidoForm[];

    estado: EstadoPedido;
    estado_pago: EstadoPago;
}

// --- CONSULTAR HISTORIAL ---
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
    };
}

// Interface para mostrar detalles del pedido al hacer la compra
export interface PedidoDetalleDTO {
    numero_pedido: number;
    estado: string;
    estado_pago: string;
    
    comprador_nombre: string | null;
    metodo_entrega: string;
    metodo_pago: string;
    envio_a_coordinar: boolean;
    costo_envio: number;
    subtotal: number;
    descuento_cupon: number;
    descuento_pago_efectivo: number;
    total_final: number;
    creado_el: string;

    productos: {
        producto_nombre: string;
        presentacion_unidad: string;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
    }[];

    detalle_envio: {
        destinatario_email: string;
        envio_a: string;
        tipo_envio: string | null;
        sucursal_nombre: string | null;
        tracking_number: string | null;
        calle: string | null;
        numero: string | null;
        piso: string | null;
        depto: string | null;
        ciudad: string | null;
        provincia_codigo: string | null;
        codigo_postal: string | null;
    } | null;
}