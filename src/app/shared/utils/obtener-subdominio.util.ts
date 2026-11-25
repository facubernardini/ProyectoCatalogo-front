import { isDominioBase } from "src/app/core/data/domains.data";

export function obtenerSlugDesdeSubdominio(hostname: string = window.location.hostname): string | null {
  if (isDominioBase(hostname)) {
    return null;
  }

  const partes = hostname.split('.');
  const subdominio = partes[0]?.trim().toLowerCase();

  return subdominio && subdominio !== 'www' ? subdominio : null;
}