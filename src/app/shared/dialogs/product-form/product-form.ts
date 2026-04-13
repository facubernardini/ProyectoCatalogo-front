import { Component, effect, inject } from '@angular/core';
import { ProductFormService } from 'src/app/core/services/product-form.service';
import { Icon } from "@shared/components/icon";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-product-form',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  public productFormService = inject(ProductFormService);
  adminStore = inject(AdminStoreService);

  public producto = {
    nombre: '',
    descripcion: '',
    imagen: '',
    destacado: false,
    tag_evento: '',
    categorias_ids: [] as number[],
    presentaciones: [
      { unidad_venta: '', precio: null, precio_descuento: null, activo: true }
    ]
  };

  constructor() {
    effect(() => {
      const editing = this.productFormService.editingProduct();
      if (editing) {
        console.log('DATA QUE LLEGA AL FORM:', editing);
        const p = JSON.parse(JSON.stringify(editing));

        p.categorias_ids = editing.categorias?.map((c: any) => c.id) || [];

        this.producto = p;
      } else {
        this.resetForm();
      }
    });
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
  }

  isCategoriaSelected(id: number): boolean {
    return this.producto.categorias_ids?.includes(id) || false;
  }

  resetForm() {
    this.producto = {
      nombre: '',
      descripcion: '',
      imagen: '',
      destacado: false,
      tag_evento: '',
      categorias_ids: [],
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

  eliminarPresentacion(index: number) {
    if (this.producto.presentaciones.length > 1) {
      this.producto.presentaciones.splice(index, 1);
    }
  }

  guardar() {
    this.productFormService.save(this.producto);
  }

  get esFormularioInvalido(): boolean {
    return this.producto.presentaciones.some(pres => 
      pres.precio_descuento !== null && 
      pres.precio !== null && 
      Number(pres.precio_descuento) >= Number(pres.precio)
    );
  }
}
