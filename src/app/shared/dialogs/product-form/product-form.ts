import { Component, effect, inject } from '@angular/core';
import { ProductFormService } from 'src/app/core/services/product-form.service';
import { Icon } from "@shared/components/icon";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  imports: [Icon, CommonModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  public productFormService = inject(ProductFormService);

  public producto = {
    nombre: '',
    descripcion: '',
    imagen: '',
    destacado: false,
    tag_evento: '',
    presentaciones: [
      { unidad_venta: '', precio: 0, precio_descuento: null, activo: true }
    ]
  };

  constructor() {
    // Sincronizar el formulario cuando el Signal del servicio cambie
    effect(() => {
      const editing = this.productFormService.editingProduct();
      if (editing) {
        this.producto = JSON.parse(JSON.stringify(editing)); // Clonación profunda simple
      } else {
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.producto = {
      nombre: '',
      descripcion: '',
      imagen: '',
      destacado: false,
      tag_evento: '',
      presentaciones: [{ unidad_venta: '', precio: 0, precio_descuento: null, activo: true }]
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
    this.producto.presentaciones.push({ unidad_venta: '', precio: 0, precio_descuento: null, activo: true });
  }

  eliminarPresentacion(index: number) {
    if (this.producto.presentaciones.length > 1) {
      this.producto.presentaciones.splice(index, 1);
    }
  }

  guardar() {
    this.productFormService.save(this.producto);
  }
}
