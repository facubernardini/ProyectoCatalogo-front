export interface CatalogoBackoffice {
    id: number;
    vendedor_id: number;
    vendedor_nombre: string;
    rubro: string;
    
    nombre_tienda: string;
    slug: string;
    logo_tienda: string | null;
    
    creado_el: Date;
    actualizado_el: Date;

    cantidad_productos: number;
    cantidad_categorias: number;
    cantidad_cupones: number;
    cantidad_medios_pago: number;
}