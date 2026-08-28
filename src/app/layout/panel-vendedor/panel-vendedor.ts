import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductForm } from "@shared/dialogs/product-form/product-form";
import { Toast } from "src/app/shared/components/toast/toast";
import { CategoryForm } from "@shared/dialogs/category-form/category-form";
import { ConfirmDialog } from "@shared/dialogs/confirm-dialog/confirm-dialog";
import { ProductPreview } from "@shared/dialogs/product-preview/product-preview";
import { CategoryDelete } from "@shared/dialogs/category-delete/category-delete";
import { CuponForm } from "@shared/dialogs/cupon-form/cupon-form";
import { CategoryPreview } from "@shared/dialogs/category-preview/category-preview";
import { LoadingSpinner } from "@shared/components/loading-spinner/loading-spinner";
import { ProductImportPreview } from "src/app/shared/dialogs/product-import-preview/product-import-preview";
import { PanelNavbar } from "./navbar/navbar";
import { Header } from "./header/header";
import { MenuPrincipal } from "src/app/shared/dialogs/menu-principal/menu-principal";
import { PedidoPreview } from "src/app/shared/dialogs/pedido-preview/pedido-preview";
import { PedidoForm } from "src/app/shared/dialogs/pedido-form/pedido-form";
import { MenuLateralVendedor } from "./menu-lateral-vendedor/menu-lateral-vendedor";
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-panel-vendedor',
  imports: [RouterOutlet, ProductForm, Toast, CategoryForm, ConfirmDialog, ProductPreview, CategoryDelete, CuponForm, CategoryPreview, LoadingSpinner, ProductImportPreview, PanelNavbar, Header, MenuPrincipal, PedidoPreview, PedidoForm, MenuLateralVendedor, Icon],
  templateUrl: './panel-vendedor.html',
  styleUrl: './panel-vendedor.css',
})
export class PanelVendedor {
  public adminStore = inject(AdminStoreService);
  private router = inject(Router);

  isDesktop = signal(window.innerWidth >= 768);

  @HostListener('window:resize')
  onResize() {
    this.isDesktop.set(window.innerWidth >= 768);
  }

  ngOnInit() {
    const data = localStorage.getItem('vendedor');
    if (data) {
      const vendedor = JSON.parse(data);
      if (vendedor.catalogoId) {
        this.adminStore.cargarDatosPanelVendedor(vendedor.catalogoId);
      }
    }
  }

  public tituloPanelActual = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.obtenerTitulo(this.router.url))
    ),
    { initialValue: this.obtenerTitulo(this.router.url) }
  );

  // Diccionario de rutas a títulos
  private obtenerTitulo(url: string): string {
    if (url.includes('inicio')) return 'Resumen General';
    if (url.includes('perfil')) return 'Mi Perfil';
    if (url.includes('mis-productos')) return 'Gestión de Productos';
    if (url.includes('mis-pedidos')) return 'Bandeja de Pedidos';
    if (url.includes('estadisticas')) return 'Estadísticas y Ventas';
    if (url.includes('mi-tienda')) return 'Configuración de Tienda';
    if (url.includes('mis-cupones')) return 'Cupones de Descuento';
    if (url.includes('mis-categorias')) return 'Organización de Categorías';
    
    return 'Panel Vendedor';
  }
}
