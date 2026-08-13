import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadoPedido, PedidoDTO } from 'src/app/core/models/pedido.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { PedidosServiceBackend } from 'src/app/core/services-backend/pedidos.ServiceBackend';
import { Icon } from "src/app/shared/components/icon";
import { PedidoCard } from "./pedido-card/pedido-card";
import { PedidoPreviewService } from 'src/app/shared/services/pedido-preview.service';
import { PedidoFormService } from 'src/app/shared/services/pedido-form.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, PedidoCard],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css'
})
export class MisPedidos implements OnInit, OnDestroy {
  public adminStore = inject(AdminStoreService);
  public pedidoPreviewService = inject(PedidoPreviewService);
  public pedidoFormService = inject(PedidoFormService);
  private pedidoServiceBackend = inject(PedidosServiceBackend);

  // Control de Vistas y Buscador
  viendoHistorial = signal<boolean>(false);
  busquedaRaw = signal<string>('');
  busquedaDebounced = signal<string>('');
  isBuscando = signal<boolean>(false);
  
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  historialPedidos = signal<PedidoDTO[]>([]);
  historialPage = signal<number>(1);
  historialHasNext = signal<boolean>(true);
  isLoadingHistorial = signal<boolean>(false);

  // Computada maestra: Decide qué array mostrar y aplica el filtro si corresponde
  pedidosFiltrados = computed(() => {
    
    // Si estamos en el historial, devolvemos los que trajo la API (ya vienen filtrados y ordenados del back)
    if (this.viendoHistorial()) {
      return this.historialPedidos();
    } 
    
    // Si estamos en la vista principal (Pendientes), leemos de la Store en memoria
    const todos = this.adminStore.pedidosActivos(); 
    if (!Array.isArray(todos)) return [];
    
    let pendientes = todos.filter(p => p.estado === EstadoPedido.PENDIENTE);
    
    const query = this.busquedaDebounced().toLowerCase().trim();
    if (query) {
      pendientes = pendientes.filter(p => 
        p.comprador_nombre?.toLowerCase().includes(query) ||
        p.numero_pedido?.toString().includes(query)
      );
    }
    
    return pendientes.sort((a, b) => new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime());
  });

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.busquedaDebounced.set(query);
      
      if (query.length > 0) {
        if (this.viendoHistorial()) {
          this.cargarHistorial(true);
        } else {
          this.isBuscando.set(false);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
  }

  onSearchInput(valor: string) {
    this.busquedaRaw.set(valor);
    const queryTrim = valor.trim();
    
    if (queryTrim.length > 0) {
      this.isBuscando.set(true);
      this.searchSubject.next(queryTrim);
    } else {
      this.limpiarBusqueda();
    }
  }

  limpiarBusqueda() {
    this.busquedaRaw.set('');
    this.busquedaDebounced.set('');
    this.isBuscando.set(false);
    
    this.searchSubject.next(''); 

    if (this.viendoHistorial()) {
      this.cargarHistorial(true);
    }
  }

  toggleHistorial() {
    const entraraHistorial = !this.viendoHistorial();
    
    // 1. Limpiamos variables temporalmente SIN llamar a la API
    this.busquedaRaw.set('');
    this.busquedaDebounced.set('');
    this.isBuscando.set(false);
    this.searchSubject.next('');
    
    // 2. Cambiamos la vista
    this.viendoHistorial.set(entraraHistorial);
    
    // 3. Si entramos, cargamos SIEMPRE la API para traer la data fresca
    if (entraraHistorial) {
      this.cargarHistorial(true);
    }
  }

  cargarHistorial(reset: boolean = false) {
    const catalogoId = this.adminStore.catalogo()?.id;
    if (!catalogoId) return;

    if (reset) {
      this.historialPage.set(1);
      this.historialHasNext.set(true);
      
      // 👉 ESTA ES LA SOLUCIÓN: Vaciamos la lista vieja inmediatamente
      this.historialPedidos.set([]); 
    }

    if (!this.historialHasNext() || this.isLoadingHistorial()) return;

    this.isLoadingHistorial.set(true);
    
    // Si NO estamos reseteando (es decir, estamos paginando hacia abajo), O si el usuario está buscando activamente,
    // activamos el spinner chiquito del buscador.
    if (!reset || this.busquedaDebounced().length > 0) {
      this.isBuscando.set(true); 
    }

    this.pedidoServiceBackend.getHistorialPedidos(
      catalogoId,
      this.historialPage(),
      15,
      this.busquedaDebounced()
    ).subscribe({
      next: (res) => {
        if (reset) {
          this.historialPedidos.set(res.data);
        } else {
          this.historialPedidos.update(prev => [...prev, ...res.data]);
        }
        
        this.historialHasNext.set(res.meta.hasNextPage);
        if (res.meta.hasNextPage) {
          this.historialPage.update(p => p + 1);
        }
        
        this.isLoadingHistorial.set(false);
        this.isBuscando.set(false); 
      },
      error: (err) => {
        console.error('Error cargando historial', err);
        this.isLoadingHistorial.set(false);
        this.isBuscando.set(false);
      }
    });
  }

  onScroll(event: Event) {
    if (!this.viendoHistorial()) return;

    const element = event.target as HTMLElement;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
      this.cargarHistorial();
    }
  }

  abrirModalDetalle(pedido: PedidoDTO) {
    this.pedidoPreviewService.open(pedido);
  }

  registrarNuevoPedido() {
    this.pedidoFormService.open();
  }
}