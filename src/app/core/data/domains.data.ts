export const DOMINIOS_BASE = [
  'changu.com.ar', 'www.changu.com.ar',
  'listalo.com.ar', 'www.listalo.com.ar',
  'localhost', '127.0.0.1', '192.168.1.13'
];

/**
 * Verifica si el host actual pertenece a la plataforma principal
 * y no a la tienda de un vendedor.
 */
export function isDominioBase(host: string): boolean {
  return DOMINIOS_BASE.includes(host);
}