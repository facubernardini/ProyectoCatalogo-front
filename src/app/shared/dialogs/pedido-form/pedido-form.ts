import { Component, computed, effect, inject, OnDestroy, OnInit, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from '@shared/components/icon';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { PedidosServiceBackend } from 'src/app/core/services-backend/pedidos.ServiceBackend';
import { PedidoFormService } from '../../services/pedido-form.service';
import { CrearPedidoRequest, EstadoPago, EstadoPedido, PedidoDTO, ProductoPedidoForm } from 'src/app/core/models/pedido.model';
import { MedioPago } from '../../enums/medio-pago.enum';
import { MetodoEntrega } from '../../enums/metodo-entrega.enum';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon],
  templateUrl: './pedido-form.html',
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
export class PedidoForm implements OnInit, OnDestroy {
  public pedidoFormService = inject(PedidoFormService);
  private adminStore = inject(AdminStoreService);
  private pedidoServiceBackend = inject(PedidosServiceBackend);
  private toastService = inject(ToastService);

  listaMediosPago = Object.values(MedioPago);
  listaMetodosEntrega = Object.values(MetodoEntrega);
  listaEstadosPedido = Object.values(EstadoPedido);
  listaEstadosPago = Object.values(EstadoPago).filter(estado => estado !== EstadoPago.REEMBOLSADO);

  // --- LÓGICA DE BÚSQUEDA DE PRODUCTOS ---
  searchQuery = signal<string>('');
  isSearchingActive = computed(() => this.searchQuery().trim().length > 0);
  isLoadingResults = signal<boolean>(false);

  resultadosBusquedaCompletos = signal<any[]>([]);
  resultadosVisibles = signal<any[]>([]);

  private itemsPorPagina = 15;
  private paginaActual = 1;

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  resultadosBusqueda = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];

    const resultados: any[] = [];
    const productosStore = this.adminStore.productos();

    for (const prod of productosStore) {
      if (!prod.activo) continue;

      const matchNombreProducto = prod.nombre.toLowerCase().includes(query);

      for (const pres of (prod.presentaciones || [])) {
        if (!pres.activo) continue;

        if (matchNombreProducto || pres.unidad_venta.toLowerCase().includes(query)) {
          resultados.push({
            producto_id: prod.id,
            presentacionId: pres.id,
            nombreProducto: prod.nombre,
            unidadVenta: pres.unidad_venta,
            precioFinal: pres.precio_descuento || pres.precio,
            imagen: prod.imagen
          });
        }
      }
    }

    return resultados;
  });

  constructor() {
    effect(() => {
      const estaAbierto = this.pedidoFormService.isOpen();

      untracked(() => {
        if (!estaAbierto) {
          this.limpiarBusqueda();
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

  onSearchInput(valor: string) {
    this.searchQuery.set(valor);
    const queryTrim = valor.trim();
    
    if (queryTrim.length > 0) {
      this.isLoadingResults.set(true);
      this.searchSubject.next(queryTrim);
    } else {
      this.limpiarBusqueda();
    }
  }

  onMetodoEntregaChange(nuevoMetodo: string) {
    if (nuevoMetodo === 'Retiro') {
      this.pedidoFormService.formData.update(data => ({
        ...data,
        comprador_direccion: ''
      }));
    }
  }

  private ejecutarBusquedaEnMemoria(query: string) {
    const queryLower = query.toLowerCase();
    const productosStore = this.adminStore.productos();
    const resultados: any[] = [];

    for (const prod of productosStore) {
      if (!prod.activo) continue;

      const matchNombreProducto = prod.nombre.toLowerCase().includes(queryLower);

      for (const pres of (prod.presentaciones || [])) {
        if (!pres.activo) continue;

        if (matchNombreProducto || pres.unidad_venta.toLowerCase().includes(queryLower)) {
          resultados.push({
            producto_id: prod.id,
            presentacionId: pres.id,
            nombreProducto: prod.nombre,
            unidadVenta: pres.unidad_venta,
            precioFinal: pres.precio_descuento || pres.precio,
            imagen: prod.imagen
          });
        }
      }
    }

    // Guardamos TODOS los resultados
    this.resultadosBusquedaCompletos.set(resultados);
    
    // Reiniciamos la paginación a la página 1
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

  // Detecta cuando el usuario scrollea al final del contenedor de resultados
  onScrollResultados(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      this.cargarMasResultados(false);
    }
  }

  hacerScrollBuscador(elementoBuscador: HTMLElement) {
    setTimeout(() => {
      elementoBuscador.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }, 300);
  }

  limpiarBusqueda() {
    this.searchQuery.set('');
    this.resultadosBusquedaCompletos.set([]);
    this.resultadosVisibles.set([]);
    this.isLoadingResults.set(false);
  }

  // --- LÓGICA DEL CARRITO (Agregar, Quitar, Eliminar) ---

  agregarProducto(item: any) {
    this.pedidoFormService.formData.update(data => {
      const productoExistente = data.productos.find(p => p.presentacion_id === item.presentacionId);

      if (productoExistente) {
        productoExistente.cantidad += 1;
      } else {
        const nuevoProducto: ProductoPedidoForm = {
          producto_id: item.producto_id,
          presentacion_id: item.presentacionId,
          producto_nombre: item.nombreProducto,
          presentacion_unidad: item.unidadVenta,
          precio_unitario: item.precioFinal,
          cantidad: 1,
          imagen: item.imagen
        };
        data.productos.push(nuevoProducto);
      }
      return { ...data };
    });

    this.limpiarBusqueda(); 
  }

  sumarCantidad(index: number) {
    this.pedidoFormService.formData.update(data => {
      data.productos[index].cantidad += 1;
      return { ...data };
    });
  }

  restarCantidad(index: number) {
    this.pedidoFormService.formData.update(data => {
      if (data.productos[index].cantidad > 1) {
        data.productos[index].cantidad -= 1;
      }
      return { ...data };
    });
  }

  eliminarProducto(index: number) {
    this.pedidoFormService.formData.update(data => {
      data.productos.splice(index, 1);
      return { ...data };
    });
  }

  // --- LÓGICA FINANCIERA  ---

  descuentoEfectivoCatalogo(): number {
    return this.adminStore.catalogo()?.descuento_en_efectivo || 0;
  }

  costoEnvioCatalogo(): number {
    return Number(this.adminStore.catalogo()?.costo_envio) || 0;
  }

  envioGratisDesdeCatalogo(): number {
    return Number(this.adminStore.catalogo()?.envio_gratis_desde) || 0;
  }

  calcularSubtotal(): number {
    const productos = this.pedidoFormService.formData().productos;
    if (!productos || productos.length === 0) return 0;
    
    return productos.reduce((total, prod) => total + (prod.precio_unitario * prod.cantidad), 0);
  }

  calcularMontoDescuento(): number {
    const formData = this.pedidoFormService.formData();
    const pagoEfectivo = formData.metodo_pago === 'Efectivo';
    const porcentajeDescuento = this.descuentoEfectivoCatalogo();
    
    if (pagoEfectivo && porcentajeDescuento > 0) {
      const subtotal = this.calcularSubtotal();
      return (subtotal * porcentajeDescuento) / 100;
    }
    return 0;
  }

  calcularSubtotalConDescuentos(): number {
    return Math.max(0, this.calcularSubtotal() - this.calcularMontoDescuento());
  }

  esEnvioGratis(): boolean {
    const formData = this.pedidoFormService.formData();
    if (formData.metodo_entrega !== 'Envio') return false;

    const threshold = this.envioGratisDesdeCatalogo();
    if (threshold <= 0) return false;

    return this.calcularSubtotalConDescuentos() >= threshold;
  }

  calcularCostoEnvioFinal(): number {
    const formData = this.pedidoFormService.formData();
    if (formData.metodo_entrega !== 'Envio') return 0;

    if (this.esEnvioGratis()) {
      return 0;
    }
    return this.costoEnvioCatalogo();
  }

  calcularTotalFinal(): number {
    return this.calcularSubtotalConDescuentos() + this.calcularCostoEnvioFinal();
  }

  // --- GUARDAR PEDIDO EN BACKEND ---

  guardarPedido() {
    const formData = this.pedidoFormService.formData();
    const catalogoId = this.adminStore.catalogo()?.id;
    
    // 1. Validaciones
    if (!catalogoId || formData.productos.length === 0 || !formData.comprador_nombre) {
      this.toastService.show('Faltan datos obligatorios', 'error');
      return;
    }

    // 2. Mapeamos la data de la UI a tu CrearPedidoRequest estricto
    const payload: CrearPedidoRequest = {
      catalogo_id: catalogoId,
      comprador_nombre: formData.comprador_nombre,
      comprador_direccion: formData.metodo_entrega === 'Envio' ? formData.comprador_direccion : null,
      comprador_telefono: null,
      metodo_entrega: formData.metodo_entrega,
      costo_envio: this.calcularCostoEnvioFinal(),
      
      metodo_pago: formData.metodo_pago,
      estado: formData.estado,
      estado_pago: formData.estado_pago,
      
      // Limpiamos los productos: solo enviamos lo que pide ProductoPedidoRequest
      productos: formData.productos.map(p => ({
        producto_id: p.producto_id,
        presentacion_id: p.presentacion_id,
        cantidad: p.cantidad
      }))
    };

    const proceso = this.toastService.loading('Creando pedido...');

    // 3. Llamada al backend
    this.pedidoServiceBackend.registrarPedidoManual(payload).subscribe({
      next: (nuevoPedido: PedidoDTO) => {
        this.adminStore.agregarNuevoPedidoALista(nuevoPedido);
        proceso.success(`Pedido #${nuevoPedido.numero_pedido} creado correctamente`);
        this.pedidoFormService.close();
      },
      error: (err) => {
        console.error('Error creando pedido manual', err);
        proceso.error('Error al crear el pedido. Intentá de nuevo');
      }
    });
  }

  formatearEnum(texto: string): string {
    if (!texto) return '';
    const sinGuiones = texto.replace(/_/g, ' ').toLowerCase();
    return sinGuiones.charAt(0).toUpperCase() + sinGuiones.slice(1);
  }
}