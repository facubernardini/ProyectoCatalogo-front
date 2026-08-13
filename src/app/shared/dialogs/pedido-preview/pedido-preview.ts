import { Component, computed, inject, OnInit, OnDestroy, signal, effect, untracked } from '@angular/core';
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
    ]),
    trigger('popAnimationSimple', [
      transition(':increment, :decrement', [
        style({ opacity: 0 }),
        animate('250ms ease-in-out', style({ opacity: 1 }))
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
  isSearchingActive = signal<boolean>(false);
  isLoadingResults = signal<boolean>(false);

  isDropdownEntregaOpen = signal<boolean>(false);
  isDropdownPagoOpen = signal<boolean>(false);

  resultadosBusquedaCompletos = signal<ResultadoBusqueda[]>([]);
  resultadosVisibles = signal<ResultadoBusqueda[]>([]);
  private itemsPorPagina = 15;
  private paginaActual = 1;
  
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  
  pedidoEditable = signal<PedidoDTO | null>(null);
  
  isEditing = this.pedidoPreviewService.isEditing;

  listaMediosPago = Object.values(MedioPago);
  medioPagoIcons = MEDIO_PAGO_ICONS;
  listaMetodosEntrega = Object.values(MetodoEntrega);
  metodoEntregaIcons = METODO_ENTREGA_ICONS;

  estadoPedido = EstadoPedido;
  mediosPago = MedioPago;

  cantidadArticulos = computed(() => {
    const p = this.pedidoEditable();
    if (!p?.productos) return 0;
    return p.productos.reduce((total, item) => total + item.cantidad, 0);
  });

  constructor() {
    effect(() => {
      const pedidoDelServicio = this.pedidoPreviewService.pedidoSeleccionado();
      const estaAbierto = this.pedidoPreviewService.isOpen();

      untracked(() => {
        if (pedidoDelServicio) {
          this.pedidoEditable.set(JSON.parse(JSON.stringify(pedidoDelServicio)));
        } else {
          this.pedidoEditable.set(null);
        }

        if (!estaAbierto) {
          this.cancelarBusqueda();
        }
      });
    });
  }

  ngOnInit() {    
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
    const p = this.pedidoEditable();
    if (p?.estado === EstadoPedido.LISTO_PARA_ENTREGAR) {
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

    this.resultadosBusquedaCompletos.set(resultadosPlanos);
    this.paginaActual = 1;
    this.cargarMasResultados(true);
    
    this.isLoadingResults.set(false);
  }

  cargarMasResultados(reset: boolean = false) {
    if (reset) {
      this.resultadosVisibles.set(this.resultadosBusquedaCompletos().slice(0, this.itemsPorPagina));
    } else {
      const start = this.paginaActual * this.itemsPorPagina;
      const end = start + this.itemsPorPagina;
      const nuevosItems = this.resultadosBusquedaCompletos().slice(start, end);
      
      if (nuevosItems.length > 0) {
        this.resultadosVisibles.update(actuales => [...actuales, ...nuevosItems]);
        this.paginaActual++;
      }
    }
  }

  onScrollResultados(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      this.cargarMasResultados(false);
    }
  }

  cancelarBusqueda() {
    this.searchQuery = '';
    this.isSearchingActive.set(false);
    this.isLoadingResults.set(false);
    this.resultadosBusquedaCompletos.set([]);
    this.resultadosVisibles.set([]);
  }

  // --- LÓGICA DE MODIFICACIÓN DEL PEDIDO ---
  
  agregarProducto(resultado: ResultadoBusqueda) {
    this.pedidoEditable.update(p => {
      if (!p) return p;
      if (!p.productos) p.productos = [];

      const itemExistente = p.productos.find(item => item.presentacion_id === resultado.presentacionId);

      if (itemExistente) {
        itemExistente.cantidad += 1;
      } else {
        p.productos.push({
          producto_id: resultado.productoId,
          presentacion_id: resultado.presentacionId,
          producto_nombre: resultado.nombreProducto,
          presentacion_unidad: resultado.unidadVenta, 
          precio_unitario: resultado.precioFinal, 
          cantidad: 1,
          imagen: resultado.imagen
        } as any); 
      }
      return { ...p };
    });

    this.recalcularTotalesDinamicos();
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
      if (!this.isEditing() || !this.pedidoEditable()?.productos) return;
      
      this.pedidoEditable.update(p => {
        if (!p) return p;
        p.productos.splice(index, 1);
        return { ...p };
      });
      
      this.recalcularTotalesDinamicos();
    }
  }

  sumarCantidad(index: number) {
    if (!this.isEditing() || !this.pedidoEditable()?.productos) return;
    
    this.pedidoEditable.update(p => {
      if (!p) return p;
      p.productos[index].cantidad += 1;
      return { ...p };
    });
    
    this.recalcularTotalesDinamicos();
  }

  restarCantidad(index: number) {
    if (!this.isEditing() || !this.pedidoEditable()?.productos) return;
    
    this.pedidoEditable.update(p => {
      if (!p) return p;
      if (p.productos[index].cantidad > 1) {
        p.productos[index].cantidad -= 1;
      }
      return { ...p };
    });
    
    this.recalcularTotalesDinamicos();
  }

  // --- LÓGICA FINANCIERA (Refleja el Backend en tiempo real) ---

  descuentoEfectivoCatalogo(): number { return Number(this.adminStore.catalogo()?.descuento_en_efectivo) || 0; }
  costoEnvioCatalogo(): number { return Number(this.adminStore.catalogo()?.costo_envio) || 0; }
  envioGratisDesdeCatalogo(): number { return Number(this.adminStore.catalogo()?.envio_gratis_desde) || 0; }

  // Se ejecuta cuando cambian los Selects de Pago o Entrega en el HTML
  onMetodoCambio() {
    this.recalcularTotalesDinamicos();
  }

  recalcularTotalesDinamicos() {
    this.pedidoEditable.update(p => {
      if (!p) return p;
      
      if (!p.productos || p.productos.length === 0) {
        p.subtotal = 0;
        p.descuento_cupon = 0;
        p.descuento_pago_efectivo = 0;
        p.costo_envio = 0;
        p.total_final = 0;
        return { ...p };
      }

      // 1. Calcular Subtotal
      p.subtotal = p.productos.reduce((acc, item) => acc + (item.cantidad * Number(item.precio_unitario)), 0);

      // 2. Mantener/Recalcular Cupón Original
      if (p.cupon_codigo) {
        if (p.cupon_es_porcentaje) {
          p.descuento_cupon = p.subtotal * (Number(p.cupon_descuento) / 100);
        } else {
          p.descuento_cupon = Number(p.cupon_descuento);
        }
        if (p.descuento_cupon > p.subtotal) p.descuento_cupon = p.subtotal;
      } else {
        p.descuento_cupon = 0;
      }

      // 3. Calcular Descuento en Efectivo
      const pagoEfectivo = p.metodo_pago && p.metodo_pago.toLowerCase().includes('efectivo');
      const porcEfectivo = this.descuentoEfectivoCatalogo();
      
      if (pagoEfectivo && porcEfectivo > 0) {
        const baseParaEfectivo = p.subtotal - p.descuento_cupon;
        p.descuento_pago_efectivo = baseParaEfectivo * (porcEfectivo / 100);
      } else {
        p.descuento_pago_efectivo = 0;
      }

      // 4. Calcular Envío (Evalúa si llega al gratis)
      if (p.metodo_entrega === 'Envio') {
        const subtotalConDescuentos = p.subtotal - p.descuento_cupon - p.descuento_pago_efectivo;
        const minimoEnvioGratis = this.envioGratisDesdeCatalogo();

        if (minimoEnvioGratis > 0 && subtotalConDescuentos >= minimoEnvioGratis) {
          p.costo_envio = 0; // Bonificado
        } else {
          p.costo_envio = this.costoEnvioCatalogo(); // Cobrado
        }
      } else {
        p.costo_envio = 0;
      }

      // 5. Total Final
      p.total_final = (p.subtotal - p.descuento_cupon - p.descuento_pago_efectivo) + p.costo_envio;

      return { ...p };
    });
  }

  datosInvalidos(): boolean {
    const p = this.pedidoEditable();
    if (!p) return true;
    return !p.comprador_nombre || (p.productos?.length === 0);
  }

  guardar() {
    if (this.datosInvalidos()) return;
    
    const p = this.pedidoEditable();
    if (!p) return;

    const proceso = this.toastService.loading('Guardando cambios...');

    this.pedidoServiceBackend.editarPedido(p.id, p).subscribe({
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