import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { EstadoPedido, PedidoDTO } from 'src/app/core/models/pedido.model';
import { Producto } from 'src/app/core/models/producto.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { PedidosManagerService } from 'src/app/core/services/pedidos-manager.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { APP_CONFIG } from 'src/app/shared/constants/app.constants';
import { SuscripcionEstado } from 'src/app/shared/enums/suscripcion.enum';
import { PedidoFormService } from 'src/app/shared/services/pedido-form.service';
import { PedidoPreviewService } from 'src/app/shared/services/pedido-preview.service';
import { ProductPreviewService } from 'src/app/shared/services/product-preview.service';

@Component({
  selector: 'app-dashboard',
  imports: [Icon, RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public adminStore = inject(AdminStoreService);
  public pedidoFormService = inject(PedidoFormService);
  private pedidosManager = inject(PedidosManagerService);
  private pedidoPreviewService = inject(PedidoPreviewService);
  private productoPreviewService = inject(ProductPreviewService);
  private toastService = inject(ToastService);

  estadoPedido = EstadoPedido;
  estadoSuscripcion = SuscripcionEstado;

  readonly umbralStock = APP_CONFIG.AVISO_BAJO_STOCK;
  readonly diasParaPagar = APP_CONFIG.DIAS_PARA_PAGAR_SUSCRIPCION;

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

  // SUSCRIPCION
  diasRestantes = computed(() => {
    const fechaFin = this.adminStore.vendedor()?.suscripcion?.fecha_fin;
    if (!fechaFin) return null;

    const hoy = new Date();
    const fin = new Date(fechaFin);

    hoy.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const diferenciaMs = fin.getTime() - hoy.getTime();
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    
    return dias;
  });

  renovarSuscripcion() {
    const numeroLimpio = BRAND_DATA.contact.whatsapp.replace(/\D/g, '');
        
    const mensaje = encodeURIComponent('Hola, quiero renovar la suscripción de mi tienda.');
    
    const url = `https://wa.me/${numeroLimpio}?text=${mensaje}`;
    
    window.open(url, '_blank');
  }

  async finalizarPedido(pedido: PedidoDTO) {
    await this.pedidosManager.finalizarPedido(pedido);
  }

  async cancelarPedido(pedido: PedidoDTO) {
    await this.pedidosManager.cancelarPedido(pedido);
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
