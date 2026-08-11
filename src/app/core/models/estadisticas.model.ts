export interface BeneficiosResumenDTO {
  total_ventas: number;        // Suma de los total_final de pedidos completados/pagados
  cantidad_pedidos: number;    // Cuántos pedidos se hicieron en ese rango
  ticket_promedio: number;     // total_ventas / cantidad_pedidos (Opcional, pero muy útil)
  
  // (Opcional) Para gráficos o comparativas:
  variacion_porcentaje?: number; // Crecimiento vs periodo anterior (ej: +12%)
}