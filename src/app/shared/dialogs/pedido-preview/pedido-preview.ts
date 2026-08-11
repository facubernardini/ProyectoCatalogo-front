import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from "@shared/components/icon";
import { EstadoPedido, PedidoDTO } from 'src/app/core/models/pedido.model';
import { PedidoPreviewService } from '../../services/pedido-preview.service';
import { SwipeDownDirective } from 'src/app/core/directives/swipe-down.directive';
import { MEDIO_PAGO_ICONS, MedioPago } from '../../enums/medio-pago.enum';
import { METODO_ENTREGA_ICONS, MetodoEntrega } from '../../enums/metodo-entrega.enum';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { PedidosServiceBackend } from 'src/app/core/services-backend/pedidos.ServiceBackend';

interface ResultadoBusqueda {
  productoId: number;
  presentacionId: number;
  nombreProducto: string;
  unidadVenta: string;
  precioFinal: number;
  imagen: string | null;
}

@Component({
  selector: 'app-pedido-preview',
  standalone: true,
  imports: [CommonModule, Icon, FormsModule, SwipeDownDirective],
  templateUrl: './pedido-preview.html',
  animations: [
    trigger('popAnimation', [
      transition(':decrement', [
        style({ transform: 'translateY(10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      
      transition(':increment', [
        style({ transform: 'translateY(-10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class PedidoPreview implements OnInit, OnDestroy {
  public adminStore = inject(AdminStoreService);
  public pedidoPreviewService = inject(PedidoPreviewService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private pedidoServiceBackend = inject(PedidosServiceBackend);

  searchQuery = '';
  resultadosBusqueda = signal<ResultadoBusqueda[]>([]);
  isSearchingActive = signal<boolean>(false);
  isLoadingResults = signal<boolean>(false);
  
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  
  pedido!: PedidoDTO;
  isEditing = this.pedidoPreviewService.isEditing;

  listaMediosPago = Object.values(MedioPago);
  medioPagoIcons = MEDIO_PAGO_ICONS;
  listaMetodosEntrega = Object.values(MetodoEntrega);
  metodoEntregaIcons = METODO_ENTREGA_ICONS;

  cantidadArticulos = computed(() => {
    const p = this.pedido;
    if (!p?.productos) return 0;
    return p.productos.reduce((total, item) => total + item.cantidad, 0);
  });

  ngOnInit() {
    const actual = this.pedidoPreviewService.pedidoSeleccionado();
    if (actual) {
      this.pedido = JSON.parse(JSON.stringify(actual));
    }

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.ejecutarBusquedaEnMemoria(query);
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  cerrar() {
    this.pedidoPreviewService.close();
  }

  toggleEdit() {
    if (this.pedido.estado === EstadoPedido.LISTO_PARA_ENTREGAR) {
      this.toastService.show('Los pedidos listos para entregar no se pueden editar', 'info');
      return;
    }

    this.isEditing.update(v => !v);
    if (!this.isEditing()) {
      this.cancelarBusqueda();
    }
  }

  // --- Lógica del Buscador ---
  onSearchInput() {
    const query = this.searchQuery.trim();
    
    if (query.length > 0) {
      this.isSearchingActive.set(true);
      this.isLoadingResults.set(true);
      this.searchSubject.next(query);
    } else {
      this.cancelarBusqueda();
    }
  }

  private ejecutarBusquedaEnMemoria(query: string) {
    const queryLower = query.toLowerCase();
    const productosMemoria = this.adminStore.productos();
    const resultadosPlanos: ResultadoBusqueda[] = [];

    for (const prod of productosMemoria) {
      if (prod.nombre.toLowerCase().includes(queryLower)) {
        
        for (const pres of prod.presentaciones) {
          if (pres.activo) {
            resultadosPlanos.push({
              productoId: prod.id,
              presentacionId: pres.id,
              nombreProducto: prod.nombre,
              unidadVenta: pres.unidad_venta,
              precioFinal: pres.precio_descuento ? pres.precio_descuento : pres.precio,
              imagen: prod.imagen
            });
          }
        }
      }
    }

    this.resultadosBusqueda.set(resultadosPlanos.slice(0, 20)); 
    this.isLoadingResults.set(false);
  }

  cancelarBusqueda() {
    this.searchQuery = '';
    this.isSearchingActive.set(false);
    this.isLoadingResults.set(false);
    this.resultadosBusqueda.set([]);
  }

  // --- Lógica de Modificación del Pedido ---

  agregarProducto(resultado: ResultadoBusqueda) {
    if (!this.pedido.productos) {
      this.pedido.productos = [];
    }

    const itemExistente = this.pedido.productos.find(p => p.presentacion_id === resultado.presentacionId);

    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      this.pedido.productos.push({
        producto_id: resultado.productoId,
        presentacion_id: resultado.presentacionId,
        producto_nombre: resultado.nombreProducto,
        presentacion_unidad: resultado.unidadVenta, 
        precio_unitario: resultado.precioFinal, 
        cantidad: 1,
        imagen: resultado.imagen
      } as any); 
    }

    this.recalcularTotal();
    this.cancelarBusqueda();
  }

  async eliminarProducto(index: number) {
    const confirmacion = await this.confirmService.ask({
      title: '¿Quitar producto del pedido?',
      message: `Se descontará del total.`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      icon: 'trash',
      type: 'danger'
    });

    if (confirmacion) {
      if (!this.isEditing() || !this.pedido.productos) return;
      this.pedido.productos.splice(index, 1);
      this.recalcularTotal();
      this.toastService.show('Producto eliminado');
    }
  }

  sumarCantidad(index: number) {
    if (!this.isEditing() || !this.pedido.productos) return;
    this.pedido.productos[index].cantidad += 1;
    this.recalcularTotal();
  }

  restarCantidad(index: number) {
    if (!this.isEditing() || !this.pedido.productos) return;
    
    if (this.pedido.productos[index].cantidad > 1) {
      this.pedido.productos[index].cantidad -= 1;
      this.recalcularTotal();
    }
  }

  recalcularTotal() {
    if (!this.pedido.productos) {
      this.pedido.total_final = 0;
      return;
    }
    this.pedido.total_final = this.pedido.productos.reduce(
      (acc, p) => acc + (p.cantidad * p.precio_unitario), 0
    );
  }

  datosInvalidos(): boolean {
    return !this.pedido.comprador_nombre || (this.pedido.productos?.length === 0);
  }

  guardar() {
    if (this.datosInvalidos()) return;

    const proceso = this.toastService.loading('Guardando cambios...');

    this.pedidoServiceBackend.editarPedido(this.pedido.id, this.pedido).subscribe({
      next: (pedidoActualizadoDesdeBackend) => {
        proceso.success('Pedido actualizado correctamente');
        
        this.adminStore.actualizarUnPedidoEnLista(pedidoActualizadoDesdeBackend);
        
        this.cerrar();
      },
      error: (err) => {
        console.error('Error al guardar el pedido:', err);
        proceso.error('Error al guardar los cambios. Intenta de nuevo.');
      }
    });
  }
}