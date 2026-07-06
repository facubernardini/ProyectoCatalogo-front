import { Component, effect, inject, signal, computed } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ProductFormService } from '@shared/services/product-form.service';

@Component({
  selector: 'app-product-form',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  public productFormService = inject(ProductFormService);
  public adminStore = inject(AdminStoreService);
  public confirmService = inject(ConfirmService);

  private toastService = inject(ToastService);

  public producto = {
    nombre: '',
    marca: '',
    descripcion: '',
    imagen: '',
    destacado: false,
    categorias_ids: [] as number[],
    tags_ids: [] as number[],
    presentaciones: [
      { unidad_venta: '', precio: null, precio_descuento: null, activo: true }
    ]
  };

  public imagenPendiente: File | null = null;
  public imagenPreviewTemporal = signal<string | null>(null);

  MAX_SIZE_MB = 10;

  public isCategoriaDropdownOpen = signal(false);
  public searchQuery = signal('');

  public categoriasFiltradas = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const categorias = this.adminStore.categorias();
    
    if (!query) return categorias;
    
    return categorias.filter(c => c.nombre.toLowerCase().includes(query));
  });

  constructor() {
    effect(() => {
      const isOpen = this.productFormService.isOpen();
      const editing = this.productFormService.editingProduct();

      if (isOpen) {
        if (editing) {
          const p = JSON.parse(JSON.stringify(editing));
          p.categorias_ids = editing.categorias?.map((c: any) => c.id) || [];
          p.tags_ids = editing.tags?.map((t: any) => t.id) || [];
          p.marca = p.marca || '';
          this.producto = p;
        } else {
          this.resetForm();
        }
      } else {
        this.resetForm();
      }
    });
  }

  // --- LÓGICA DE CATEGORÍAS Y BUSCADOR ---

  abrirDropdownYScroll(container: HTMLElement) {
    this.isCategoriaDropdownOpen.set(true);
    
    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  cerrarDropdown(inputElement?: HTMLInputElement) {

    this.isCategoriaDropdownOpen.set(false);
    this.searchQuery.set('');
  }

  toggleCategoria(id: number) {
    if (!this.producto.categorias_ids) {
      this.producto.categorias_ids = [];
    }
    
    const index = this.producto.categorias_ids.indexOf(id);
    if (index > -1) {
      this.producto.categorias_ids.splice(index, 1);
    } else {
      this.producto.categorias_ids.push(id);
    }

    this.searchQuery.set('');
  }

  isCategoriaSelected(id: number): boolean {
    return this.producto.categorias_ids?.includes(id) || false;
  }

  // --- LÓGICA DE TAGS ---

  toggleTag(id: number) {
    if (!this.producto.tags_ids) {
      this.producto.tags_ids = [];
    }
    
    const index = this.producto.tags_ids.indexOf(id);
    if (index > -1) {
      this.producto.tags_ids.splice(index, 1);
    } else {
      this.producto.tags_ids.push(id);
    }
  }

  isTagSelected(id: number): boolean {
    return this.producto.tags_ids?.includes(id) || false;
  }

  resetForm() {
    this.producto = {
      nombre: '',
      marca: '',
      descripcion: '',
      imagen: '',
      destacado: false,
      categorias_ids: [],
      tags_ids: [],
      presentaciones: [{ unidad_venta: '', precio: null, precio_descuento: null, activo: true }]
    };

    this.imagenPendiente = null;
    this.imagenPreviewTemporal.set(null);

    // Reseteo del buscador simplificado
    this.searchQuery.set('');
    this.isCategoriaDropdownOpen.set(false);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    
    if (!file) return;

    const MAX_SIZE_BYTES = this.MAX_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_SIZE_BYTES) {
      this.toastService.show(`La imagen es demasiado grande. Máximo ${this.MAX_SIZE_MB}MB.`, 'error');
      event.target.value = ''; 
      return;
    }

    this.imagenPendiente = file;
    this.imagenPreviewTemporal.set(URL.createObjectURL(file));
  }

  agregarPresentacion() {
    this.producto.presentaciones.push({ unidad_venta: '', precio: null, precio_descuento: null, activo: true });
  }

  async eliminarPresentacion(index: number) {
    const sinCategorias = !this.producto.categorias_ids || this.producto.categorias_ids.length === 0;
    if (sinCategorias) {
      this.toastService.show(`Primero debes asignarle una categoría a tu producto`, 'error');
    }
    else {
      const presentaciones = this.producto.presentaciones;
      const presAEliminar = presentaciones[index];
  
      const confirmacion = await this.confirmService.ask({
        title: '¿Eliminar presentación?',
        message: `Estás por borrar "${presAEliminar.unidad_venta}" de "${this.producto.nombre}".`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Volver',
        icon: 'trash',
        type: 'danger'
      });
  
      if (confirmacion) {
        if (this.producto.presentaciones.length > 1) {
          this.producto.presentaciones.splice(index, 1);
        }
      }
    }
  }

  guardar() {
    this.productFormService.save(this.producto, this.imagenPendiente);
  }

  get esFormularioInvalido(): boolean {
    const nombreInvalido = !this.producto.nombre || this.producto.nombre.trim().length === 0;
    if (nombreInvalido) return true;

    const sinCategorias = !this.producto.categorias_ids || this.producto.categorias_ids.length === 0;
    if (sinCategorias) return true;

    return this.producto.presentaciones.some(pres => {
      const datosIncompletos = 
        !pres.unidad_venta || 
        pres.unidad_venta.trim() === '' || 
        pres.precio === null || 
        pres.precio <= 0;

      const descuentoInvalido = 
        pres.precio_descuento !== null && 
        pres.precio !== null && 
        Number(pres.precio_descuento) >= Number(pres.precio);

      return datosIncompletos || descuentoInvalido;
    });
  }
}