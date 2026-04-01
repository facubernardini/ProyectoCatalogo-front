import { Routes } from '@angular/router';
import { Backoffice } from '@layout/backoffice/backoffice';
import { CatalogoPublico } from '@layout/catalogo/catalogo';
import { Login } from '@layout/login/login';
import { PanelVendedor } from '@layout/panel-vendedor/panel-vendedor';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { MisProductos } from '@layout/panel-vendedor/mis-productos/mis-productos';
import { Dashboard } from '@layout/panel-vendedor/dashboard/dashboard';

export const routes: Routes = [
	{ path: '', component: CatalogoPublico },
	{ path: 'login', component: Login },
	{ 
        path: 'panel-vendedor', 
        component: PanelVendedor,
        canActivate: [authGuard],
        children: [
			{ path: 'inicio', component: Dashboard },
            { path: 'mis-productos', component: MisProductos },
        ]
    },

	{ path: 'backoffice', component: Backoffice, canActivate: [authGuard, adminGuard] },
	
	{ path: '**', redirectTo: '' },
];
