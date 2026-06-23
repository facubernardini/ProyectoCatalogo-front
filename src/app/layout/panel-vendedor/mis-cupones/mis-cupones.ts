import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Icon } from "@shared/components/icon";
import { Cupon } from 'src/app/core/models/cupon.model';
import { FormsModule } from '@angular/forms';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CuponFormService } from '@shared/services/cupon-form.service';
import { CuponManagerService } from 'src/app/core/services/cupones-manager.service';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-cupones',
  standalone: true,
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './mis-cupones.html',
  styleUrl: './mis-cupones.css',
})
export class MisCupones {
  private location = inject(Location);
  
  public adminStore = inject(AdminStoreService);
  public cuponFormService = inject(CuponFormService);
  public cuponManager = inject(CuponManagerService);

  hasCupones = computed(() => {
    const lista = this.adminStore.cupones();
    return lista && lista.length > 0;
  });

  busquedaRaw = signal('');
  filtro = signal('');
  isBuscando = signal(false);

  estadoFiltro = signal('todos');
  activeMenuId = signal<number | null>(null);
  isMenuUpward = signal<boolean>(false);

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  cuponesFiltrados = computed(() => {
    const ahora = new Date();
    const textoBusqueda = this.filtro().toLowerCase().trim();
    
    const listaCupones = this.adminStore.cupones() || [];

    // 1. Filtrado por texto (Buscador)
    let filtrados = listaCupones.filter(c => {
      const codigo = (c as any).codigo_cupon || (c as any).codigo || ''; 
      return codigo.toLowerCase().includes(textoBusqueda);
    });

    // 2. Filtrado por estado
    if (this.estadoFiltro() === 'activos') {
      filtrados = filtrados.filter(c => 
        c.activo && (!c.fecha_expiracion || new Date(c.fecha_expiracion) > ahora)
      );
    }
    else if (this.estadoFiltro() === 'pausados') {
      // Solo mostramos los pausados que NO estén expirados
      filtrados = filtrados.filter(c => 
        !c.activo && (!c.fecha_expiracion || new Date(c.fecha_expiracion) > ahora)
      );
    }
    else if (this.estadoFiltro() === 'expirados') {
      // Atrapa todos los que pasaron la fecha (estén pausados o no)
      filtrados = filtrados.filter(c => 
        c.fecha_expiracion && new Date(c.fecha_expiracion) <= ahora
      );
    }
    
    return filtrados;
  });

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(valor => {
      this.filtro.set(valor);
      this.isBuscando.set(false);
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchInput(valor: string) {
    this.busquedaRaw.set(valor);
    
    if (valor.trim().length > 0) {
      this.isBuscando.set(true);
    } else {
      this.isBuscando.set(false);
    }

    this.searchSubject.next(valor);
  }

  limpiarBusqueda() {
    this.busquedaRaw.set('');
    this.filtro.set('');
    this.isBuscando.set(false);
    this.searchSubject.next('');
  }

  isVencido(fecha: number | string | Date | undefined | null): boolean {
    if (!fecha) return false;
    return new Date(fecha) < new Date();
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    
    if (this.activeMenuId() !== id) {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      
      this.isMenuUpward.set(window.innerHeight - rect.bottom < 250);
    }

    this.activeMenuId.update(current => current === id ? null : id);
  }

  @HostListener('document:click')
  closeMenu() {
    this.activeMenuId.set(null);
    this.isMenuUpward.set(false);
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.activeMenuId() !== null) {
      this.activeMenuId.set(null);
      this.isMenuUpward.set(false);
    }
  }

  volverAtras() {
    this.location.back();
  }

  onAdd() {
    this.cuponFormService.openCreate();
  }

  onEdit(cupon: Cupon) {
    this.cuponFormService.openEdit(cupon);
  }

  onToggleActivo(cupon: Cupon) {
    this.cuponManager.toggleActivo(cupon);
  }

  onDelete(cupon: Cupon) {
    this.cuponManager.eliminar(cupon);
  }

  onDuplicar(cupon: Cupon) {
    this.cuponManager.duplicar(cupon);
  }
}