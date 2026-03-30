import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Validamos que el token exista y no sea una cadena de texto "null/undefined"
  if (token && token !== 'undefined' && token !== 'null') {
    return true;
  }

  // Si no hay token, lo mandamos al login
  // 'state.url' sirve para que, después de loguearse, Angular sepa a dónde quería ir el usuario
  console.warn('Acceso denegado: Redirigiendo al login');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};