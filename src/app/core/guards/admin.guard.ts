import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
	const router = inject(Router);
	const vendedorJson = localStorage.getItem('vendedor');

	if (vendedorJson) {
		const vendedor = JSON.parse(vendedorJson);

		if (vendedor.admin === true) {
			return true;
		}
	}

	console.warn('Acceso denegado: No tienes permisos de administrador');
	router.navigate(['/login']); 
	return false;
};