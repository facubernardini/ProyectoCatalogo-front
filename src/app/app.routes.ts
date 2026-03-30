import { Routes } from '@angular/router';
import { Backoffice } from '@layout/backoffice/backoffice';
import { Catalogo } from '@layout/catalogo/catalogo';
import { Login } from '@layout/login/login';
import { PanelVendedor } from '@layout/panel-vendedor/panel-vendedor';
import { authGuard } from 'src/app/core/guards/auth.guard';

export const routes: Routes = [
	{ path: '', component: Catalogo },
	{ path: 'login', component: Login },
	{ path: 'panel-vendedor', component: PanelVendedor, canActivate: [authGuard] },
	{ path: 'backoffice', component: Backoffice, canActivate: [authGuard] },
	{ path: '**', redirectTo: '' }
];
