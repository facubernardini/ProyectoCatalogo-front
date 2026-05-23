import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Icon } from "@shared/components/icon";
import { Cupon } from 'src/app/core/models/cupon.model';
import { FormsModule } from '@angular/forms';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CuponServiceBackend } from 'src/app/core/services-backend/cupones.ServiceBackend';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { CuponFormService } from '@shared/services/cupon-form.service';

@Component({
  selector: 'app-mis-cupones',
  standalone: true,
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './mis-cupones.html',
  styleUrl: './mis-cupones.css',
})
export class MisCupones {
  private location = inject(Location);
  private cuponBackend = inject(CuponServiceBackend);

  public adminStore = inject(AdminStoreService);
  public cuponFormService = inject(CuponFormService);
  private confirmService = inject(ConfirmService);

  filtro = signal('');
  estadoFiltro = signal('todos');
  activeMenuId = signal<number | null>(null);

  cuponesFiltrados = computed(() => {
    const ahora = new Date();
    const textoBusqueda = this.filtro().toLowerCase().trim();
    
    const listaCupones = this.adminStore.cupones() || [];

    // 1. Filtrado por texto (Buscador)
    let filtrados = listaCupones.filter(c => {
      // Usamos el nombre de propiedad exacto de tu DTO/Schema
      const codigo = c.codigo_cupon || ''; 
      return codigo.toLowerCase().includes(textoBusqueda);
    });

    // 2. Filtrado por estado
    if (this.estadoFiltro() === 'activos') {
      filtrados = filtrados.filter(c => 
        c.activo && (!c.fecha_expiracion || new Date(c.fecha_expiracion) > ahora)
      );
    }
    
    else if (this.estadoFiltro() === 'pausados') {
      filtrados = filtrados.filter(c => !c.activo);
    }
    
    else if (this.estadoFiltro() === 'expirados') {
      filtrados = filtrados.filter(c => 
        c.fecha_expiracion && new Date(c.fecha_expiracion) <= ahora
      );
    }
    
    return filtrados;
  });

  isVencido(fecha: number | string | Date | undefined | null): boolean {
    if (!fecha) return false;
    return new Date(fecha) < new Date();
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.activeMenuId.update(current => current === id ? null : id);
  }

  @HostListener('document:click')
  closeMenu() {
    this.activeMenuId.set(null);
  }

  // 4. Función para cambiar el estado (Pausar/Reanudar)
  async onToggleActivo(cupon: Cupon) {
    // Definimos los textos dependiendo de si lo estamos pausando o activando
    const accion = cupon.activo ? 'Pausar' : 'Reanudar';
    const icono = cupon.activo ? 'pause' : 'play';
    const mensaje = cupon.activo 
        ? `¿Pausar el cupón "${cupon.codigo_cupon}"? Los clientes ya no podrán utilizarlo.`
        : `¿Reanudar el cupón "${cupon.codigo_cupon}"? Volverá a estar disponible para tus clientes.`;

    const confirmacion = await this.confirmService.ask({
        title: `¿${accion} cupón?`,
        message: mensaje,
        confirmText: `Sí, ${accion.toLowerCase()}`,
        cancelText: 'Volver',
        icon: icono,
        type: cupon.activo ? 'warning' : 'info' // Podés ajustar el color según los tipos de tu ConfirmService
    });

    if (confirmacion) {
        const nuevoEstado = !cupon.activo;
        
        this.cuponBackend.updateCupon(cupon.id, { activo: nuevoEstado }).subscribe({
          next: (res) => {
            this.adminStore.updateCuponEnLista(res);
            // Opcional: Si tenés el toastService inyectado, podés mostrar un mensajito de éxito acá
            // this.toastService.show(`Cupón ${accion.toLowerCase()}do con éxito`);
          },
          error: (err) => {
            console.error(`Error al ${accion.toLowerCase()} el cupón:`, err);
          }
        });
    }
  }

  onAdd() {
    this.cuponFormService.openCreate();
  }

  onEdit(cupon: Cupon) {
    this.cuponFormService.openEdit(cupon);
  }

  async onDelete(cupon: Cupon) {
    this.cuponFormService.delete(cupon);
  }

  volverAtras() {
    this.location.back();
  }
}