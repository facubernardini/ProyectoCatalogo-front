import { Component, effect, inject } from '@angular/core';
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
    descripcion: '',
    imagen: '',
    destacado: false,
    categorias_ids: [] as number[],
    tags_ids: [] as number[],
    presentaciones: [
      { unidad_venta: '', precio: null, precio_descuento: null, activo: true }
    ]
  };

  constructor() {
    effect(() => {
      const isOpen = this.productFormService.isOpen();
      
      const editing = this.productFormService.editingProduct();

      if (isOpen) {
        if (editing) {
          const p = JSON.parse(JSON.stringify(editing));
          p.categorias_ids = editing.categorias?.map((c: any) => c.id) || [];
          // Mapeamos los IDs de los tags al abrir el modo edición
          p.tags_ids = editing.tags?.map((t: any) => t.id) || []; 
          this.producto = p;
        } else {
          this.resetForm();
        }
      } else {
        this.resetForm();
      }
    });
  }

  // --- LÓGICA DE CATEGORÍAS ---

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
  }

  isCategoriaSelected(id: number): boolean {
    return this.producto.categorias_ids?.includes(id) || false;
  }

  // --- LÓGICA DE TAGS (NUEVA) ---

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

  // --- RESTO DEL COMPONENTE ---

  resetForm() {
    this.producto = {
      nombre: '',
      descripcion: '',
      imagen: '',
      destacado: false,
      categorias_ids: [],
      tags_ids: [], // Limpiamos los tags al resetear
      presentaciones: [{ unidad_venta: '', precio: null, precio_descuento: null, activo: true }]
    };
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.producto.imagen = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  agregarPresentacion() {
    this.producto.presentaciones.push({ unidad_venta: '', precio: null, precio_descuento: null, activo: true });
  }

  async eliminarPresentacion(index: number) {
    const sinCategorias = !this.producto.categorias_ids || this.producto.categorias_ids.length === 0;
    if (sinCategorias) {
      this.toastService.show(`Primero debes asignarle una categoría a tu producto`, 'error');
    }
    else{
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
          this.productFormService.save(this.producto);
        }
      }
    }
  }

  guardar() {
    this.productFormService.save(this.producto);
    this.productFormService.close();
  }

  get esFormularioInvalido(): boolean {
    // 1. Validar nombre del producto (que no esté vacío ni sean solo espacios)
    const nombreInvalido = !this.producto.nombre || this.producto.nombre.trim().length === 0;
    if (nombreInvalido) return true;

    // 2. Validar que tenga al menos una categoría
    const sinCategorias = !this.producto.categorias_ids || this.producto.categorias_ids.length === 0;
    if (sinCategorias) return true;

    // 3. Validar presentaciones
    return this.producto.presentaciones.some(pres => {
      // A. Campos obligatorios vacíos o precio en 0/negativo
      const datosIncompletos = 
        !pres.unidad_venta || 
        pres.unidad_venta.trim() === '' || 
        pres.precio === null || 
        pres.precio <= 0;

      // B. Lógica de descuento (el descuento no puede ser mayor o igual al precio original)
      const descuentoInvalido = 
        pres.precio_descuento !== null && 
        pres.precio !== null && 
        Number(pres.precio_descuento) >= Number(pres.precio);

      return datosIncompletos || descuentoInvalido;
    });
  }
}