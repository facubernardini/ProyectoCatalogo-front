export interface ResumenMensualDTO {
  ingresosBrutos: number;
  crecimientoIngresos: number; // Porcentaje vs mes anterior
  gananciaNeta: number;
  crecimientoGanancia: number;
  pedidosEntregados: number;
  crecimientoPedidos: number;
}

export interface ResumenDiarioGraficoDTO {
  name: string;  // Ej: "01/08"
  value: number; // Ej: 15400 (Ganancia total de ese día - Dibuja el alto de la barra)
  extra: {
    cantidadVentas: number; // Para mostrar en el tooltip
    ingresosBrutos: number; // (Opcional) Por si querés mostrar cuánto fue ingreso y cuánto ganancia
  };
}

export interface TopProductoDTO {
  productoId: number;
  nombre: string;
  unidad: string; // Ej: "1 Kg", "Unidad" (Viene de presentacion_unidad)
  cantidadVendida: number; // Suma de la cantidad vendida
  gananciaGenerada: number;
}