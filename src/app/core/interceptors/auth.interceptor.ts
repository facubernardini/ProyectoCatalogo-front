import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services-backend/auth.ServiceBackend';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
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
        
        authService.logout();
      }
      else if (error.status === 403) {
        console.warn('Permisos insuficientes o cambio de plan detectado. Refrescando...');
        authService.refrescarSesion();
      }

      // Re-lanzamos el error para que el componente que hizo la petición también sepa que falló
      return throwError(() => error);
    })
  );
};