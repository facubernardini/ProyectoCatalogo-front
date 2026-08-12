export enum EstadoPedido {
    PENDIENTE = 'PENDIENTE',
    EN_PREPARACION = 'EN_PREPARACION',
    LISTO_PARA_ENTREGAR = 'LISTO_PARA_ENTREGAR',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO'
}

export enum EstadoPago {
    PENDIENTE = 'PENDIENTE',
    PAGADO = 'PAGADO',
    REEMBOLSADO = 'REEMBOLSADO',
}

export interface ProductoPedidoDTO {
    id: string;

    pedido_id: string;
    producto_id: number;
    presentacion_id: number;

    producto_nombre: string;
    presentacion_unidad: string;
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
    
    comprador_nombre: string;
    comprador_direccion: string | null;
    comprador_telefono: string | null;
    metodo_entrega: string;
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
}

// --- REGISTRAR PEDIDO ---

// DTO para los productos individuales que se envían en el pedido
export interface ProductoPedidoRequest {
    producto_id: number;
    presentacion_id: number;
    cantidad: number;
}

// DTO con la estructura exacta que espera tu backend
export interface CrearPedidoRequest {
    catalogo_id: number;
    comprador_nombre: string;
    comprador_direccion?: string | null;
    comprador_telefono?: string | null;
    metodo_entrega: string;
    metodo_pago: string;
    costo_envio?: number;
    cupon_codigo?: string | null;

    estado?: EstadoPedido; 
    estado_pago?: EstadoPago;

    productos: {
        producto_id: number;
        presentacion_id: number;
        cantidad: number;
    }[];
}

// DTO con la respuesta
export interface CrearPedidoResponse {
    numero_pedido: number;
}

// --- REGISTRAR PEDIDO MANUAL ---

// Extendemos tu DTO original para agregar lo que la UI necesita dibujar
export interface ProductoPedidoForm extends ProductoPedidoRequest {
  producto_nombre: string;
  presentacion_unidad: string;
  precio_unitario: number;
  imagen: string | null;
}

// Definimos el estado del Form usando una versión adaptada de CrearPedidoRequest
export interface PedidoFormData extends Omit<CrearPedidoRequest, 'catalogo_id' | 'productos'> {
  comprador_direccion: string;
  comprador_telefono: string;
  productos: ProductoPedidoForm[];

  estado: EstadoPedido;
  estado_pago: EstadoPago;
}

// --- CONSULTAR HISTORIAL
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