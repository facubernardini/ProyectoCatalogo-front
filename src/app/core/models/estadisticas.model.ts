export interface ResumenMensualDTO {
  ingresosBrutos: number;
  crecimientoIngresos: number;
  gananciaNeta: number;
  crecimientoGanancia: number;
  pedidosEntregados: number;
  crecimientoPedidos: number;
}

export interface ResumenDiarioGraficoDTO {
  name: string;
  value: number;
  extra: {
    cantidadVentas: number;
    ingresosBrutos: number;
    gananciaReal?: number;
  };
}

export interface TopProductoDTO {
  productoId: number;
  nombre: string;
  unidad: string;
  cantidadVendida: number;
}

export interface TopCategoriaDTO {
  nombre: string;
  cantidadVendida: number;
}