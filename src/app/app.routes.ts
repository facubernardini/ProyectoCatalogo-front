import { Routes, UrlSegment, UrlMatchResult } from '@angular/router';
import { Backoffice } from '@layout/backoffice/backoffice';
import { CatalogoPublico } from '@layout/catalogo/catalogo';
import { Login } from '@layout/login/login';
import { PanelVendedor } from '@layout/panel-vendedor/panel-vendedor';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { MisProductos } from '@layout/panel-vendedor/mis-productos/mis-productos';
import { Dashboard } from '@layout/panel-vendedor/dashboard/dashboard';
import { MisCategorias } from '@layout/panel-vendedor/mis-categorias/mis-categorias';
import { MiTienda } from '@layout/panel-vendedor/mi-tienda/mi-tienda';
import { Perfil } from '@layout/panel-vendedor/perfil/perfil';
import { MisCupones } from '@layout/panel-vendedor/mis-cupones/mis-cupones';
import { Home } from '@layout/home/home';
import { Register } from '@layout/register/register';
import { DashboardBO } from '@layout/backoffice/dashboard-bo/dashboard-bo';
import { Vendedores } from '@layout/backoffice/vendedores/vendedores';
import { Catalogos } from '@layout/backoffice/catalogos/catalogos';
import { ErrorView } from '@layout/error/error';
import { RecoveryPassword } from '@layout/login/recovery-password/recovery-password';
import { NotFound } from '@layout/catalogo/not-found/not-found';
import { isDominioBase } from './core/data/domains.data';
import { CargaMasiva } from './layout/panel-vendedor/carga-masiva/carga-masiva';
import { MisPedidos } from './layout/panel-vendedor/mis-pedidos/mis-pedidos';

export function subdominioMatcher(url: UrlSegment[]): UrlMatchResult | null {
    const host = window.location.hostname;

    if (isDominioBase(host)) {
        return null;
    }

    return { consumed: url }; 
}

export const routes: Routes = [
    { path: 'not-found', component: NotFound },
    { path: '404', component: ErrorView },

    { matcher: subdominioMatcher, component: CatalogoPublico },

    { path: '', component: Home },
    { path: 'register', component: Register },
    { path: 'login', component: Login },
    { path: 'recovery', component: RecoveryPassword },
    { 
        path: 'panel-vendedor', 
        component: PanelVendedor,
        canActivate: [authGuard],
        children: [
            { path: 'inicio', component: Dashboard },
            { path: 'mis-pedidos', component: MisPedidos },
            { path: 'mis-productos', component: MisProductos },
            { path: 'mis-categorias', component: MisCategorias },
            { path: 'mis-cupones', component: MisCupones },
            { path: 'carga-masiva', component: CargaMasiva },
            { path: 'mi-tienda', component: MiTienda },
            { path: 'perfil', component: Perfil },
        ]
    },
    { 
        path: 'backoffice', 
        component: Backoffice, 
        canActivate: [authGuard, adminGuard] ,
        children: [
            { path: 'inicio', component: DashboardBO },
            { path: 'vendedores', component: Vendedores },
            { path: 'catalogos', component: Catalogos },
        ]
    },
    
    { path: '**', redirectTo: '' },
];