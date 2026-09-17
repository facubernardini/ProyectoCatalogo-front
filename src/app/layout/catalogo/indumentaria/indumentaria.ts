import { Component } from '@angular/core';
import { NavbarIndumentaria } from './navbar-indumentaria/navbar-indumentaria';
import { Carrito } from 'src/app/shared/dialogs/carrito/carrito';
import { MenuInfo } from 'src/app/shared/dialogs/menu-info/menu-info';
import { ProductSelector } from 'src/app/shared/dialogs/product-selector/product-selector';
import { MapDialog } from 'src/app/shared/dialogs/map-dialog/map-dialog';
import { PedidoRealizado } from 'src/app/shared/dialogs/pedido-realizado/pedido-realizado';
import { ConfirmDialog } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog';
import { ImageViewer } from 'src/app/shared/dialogs/image-viewer/image-viewer';
import { SearchProducts } from 'src/app/shared/dialogs/search-products/search-products';
import { MenuLateral } from 'src/app/shared/dialogs/menu-lateral/menu-lateral';
import { CategoryProductsView } from 'src/app/shared/dialogs/category-products-view/category-products-view';
import { ProductosDestacados } from 'src/app/shared/dialogs/productos-destacados/productos-destacados';
import { ProductosOfertas } from 'src/app/shared/dialogs/productos-ofertas/productos-ofertas';
import { FooterDesktop } from '../footer-desktop/footer-desktop';

@Component({
  selector: 'app-indumentaria',
  imports: [NavbarIndumentaria, Carrito, MenuInfo, ProductSelector, MapDialog, PedidoRealizado, ConfirmDialog, ImageViewer, SearchProducts, MenuLateral, CategoryProductsView, ProductosDestacados, ProductosOfertas, FooterDesktop],
  templateUrl: './indumentaria.html',
  styleUrl: './indumentaria.css',
})
export class Indumentaria {}
 