import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { EstadoPedido, PedidoDTO } from 'src/app/core/models/pedido.model';
import { Producto } from 'src/app/core/models/producto.model';
import { PedidosServiceBackend } from 'src/app/core/services-backend/pedidos.ServiceBackend';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { APP_CONFIG } from 'src/app/shared/constants/app.constants';
import { PedidoPreviewService } from 'src/app/shared/services/pedido-preview.service';
import { ProductPreviewService } from 'src/app/shared/services/product-preview.service';

@Component({
  selector: 'app-dashboard',
  imports: [Icon, RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private toastService = inject(ToastService);
  public adminStore = inject(AdminStoreService);
  private pedidoServiceBackend = inject(PedidosServiceBackend);
  private confirmService = inject(ConfirmService);
  private pedidoPreviewService = inject(PedidoPreviewService);
  private productoPreviewService = inject(ProductPreviewService);

  estadoPedido = EstadoPedido;

  readonly umbralStock = APP_CONFIG.AVISO_BAJO_STOCK;

  // PEDIDOS
  cantidadPedidosPendientes = computed(() => 
    this.adminStore.pedidosActivos().filter(p => p.estado === EstadoPedido.PENDIENTE).length
  );
  
  cantidadPedidosEnPreparacion = computed(() => 
    this.adminStore.pedidosActivos().filter(p => p.estado === EstadoPedido.EN_PREPARACION).length
  );
  
  cantidadPedidosListos = computed(() => 
    this.adminStore.pedidosActivos().filter(p => p.estado === EstadoPedido.LISTO_PARA_ENTREGAR).length
  );

  pedidosPendientes = computed(() => {
    const pendientes = this.adminStore.pedidosActivos().filter(p => p.estado === EstadoPedido.PENDIENTE);
    return pendientes.sort((a, b) => new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime());
  });

  // PRODUCTOS
  presentacionesBajoStock = computed(() => {
    const productos = this.adminStore.productos();
    if (!Array.isArray(productos)) return [];
    
    const bajoStock: { productoNombre: string, unidad: string, stock: number, imagen: string | null, producto: Producto }[] = [];

    for (const prod of productos) {
      if (!prod.presentaciones) continue;
      
      for (const pres of prod.presentaciones) {
        if (pres.activo && pres.stock !== null && pres.stock <= this.umbralStock) {
          bajoStock.push({
            productoNombre: prod.nombre,
            unidad: pres.unidad_venta,
            stock: pres.stock,
            imagen: prod.imagen,
            producto: prod
          });
        }
      }
    }

    return bajoStock.sort((a, b) => a.stock - b.stock);
  });

  async finalizarPedido(pedido: PedidoDTO) {
    const confirm = await this.confirmService.ask({
        title: '¿Marcar como Entregado?',
        message: `El pedido #${pedido.numero_pedido} de ${pedido.comprador_nombre} pasará a estar finalizado.`,
        confirmText: 'Entregado',
        cancelText: 'Volver',
        icon: 'check',
        type: 'info'
    });

    if (confirm) {
      const proceso = this.toastService.loading('Actualizando...');
      this.pedidoServiceBackend.cambiarEstadoPedido(pedido.id, EstadoPedido.ENTREGADO).subscribe({
        next: (pedidoActualizado) => {
          this.adminStore.actualizarUnPedidoEnLista(pedidoActualizado);
          proceso.success('Pedido entregado');
        },
        error: () => proceso.error('Error al actualizar el pedido')
      });
    }
  }

  async cancelarPedido(pedido: PedidoDTO) {
    const confirm = await this.confirmService.ask({
        title: '¿Cancelar Pedido?',
        message: `El pedido #${pedido.numero_pedido} será cancelado y el stock regresará a tu inventario.`,
        confirmText: 'Cancelar Pedido',
        cancelText: 'Volver',
        icon: 'close',
        type: 'danger'
    });

    if (confirm) {
      const proceso = this.toastService.loading('Cancelando...');
      this.pedidoServiceBackend.cambiarEstadoPedido(pedido.id, EstadoPedido.CANCELADO).subscribe({
        next: (pedidoActualizado) => {
          this.adminStore.actualizarUnPedidoEnLista(pedidoActualizado);
          proceso.success('Pedido cancelado');
        },
        error: () => proceso.error('Error al cancelar el pedido')
      });
    }
  }

  abrirDetallePedido(pedido: PedidoDTO) {
    this.pedidoPreviewService.open(pedido);
  }

  abrirDetalleProducto(producto: any) {
    this.productoPreviewService.open(producto);
  }

  verCatalogoPublico() {
    const slug = this.adminStore.catalogo()?.slug;
    
    if (slug) {
      const currentHost = window.location.hostname;
      const baseDomain = currentHost.replace('www.', '');
      const url = `https://${slug}.${baseDomain}`;
      
      window.open(url, '_blank');
    } else {
      this.toastService.show('Primero debés configurar el nombre de tu tienda', 'error');
    }
  }

  copiarLinkCatalogo() {
    const slug = this.adminStore.catalogo()?.slug;
    
    if (slug) {
      const currentHost = window.location.hostname;
      const baseDomain = currentHost.replace('www.', '');
      const url = `https://${slug}.${baseDomain}`;
      
      navigator.clipboard.writeText(url).then(() => {
        this.toastService.show('¡Enlace copiado al portapapeles!', 'success');
      }).catch(err => {
          console.error('Error al copiar el enlace: ', err);
          this.toastService.show('No se pudo copiar el enlace', 'error');
      });
    } else {
      this.toastService.show('Primero debés configurar el nombre de tu tienda', 'error');
    }
  }
}
