import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // 1. Clonamos la petición para agregar el token si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Procesamos la petición y "escuchamos" la respuesta
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde 401 (Unauthorized), el token no sirve más
      if (error.status === 401) {
        console.warn('Sesión expirada o token inválido. Redirigiendo...');
        
        // Limpiamos los datos locales para que la app no intente usarlos de nuevo
        localStorage.removeItem('token');
        localStorage.removeItem('vendedor');
        
        // Mandamos al usuario al login
        router.navigate(['/login']);
      }

      // Re-lanzamos el error para que el componente que hizo la petición también sepa que falló
      return throwError(() => error);
    })
  );
};