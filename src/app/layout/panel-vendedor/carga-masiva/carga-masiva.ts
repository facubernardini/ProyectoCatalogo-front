import { Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Icon } from "src/app/shared/components/icon";
import { ToastService } from 'src/app/core/services/toast.service';
import { CardProducto } from "./card-producto/card-producto";
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductoImportado } from 'src/app/core/models/carga-masiva.model';
import { CargaMasivaService } from 'src/app/core/services/carga-masiva.service';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [Icon, CardProducto],
  templateUrl: './carga-masiva.html',
  styleUrl: './carga-masiva.css',
})
export class CargaMasiva {
  private location = inject(Location);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private adminStore = inject(AdminStoreService);
  
  public cargaMasivaService = inject(CargaMasivaService); 

  public isDragging = signal(false);

  volverAtras() {
    this.location.back();
    this.cargaMasivaService.reiniciarTodo();
  }

  descargarPlantilla() {
    const fileUrl = 'assets/plantilla-listalo.xlsx';
    const fileName = 'Plantilla-Listalo.xlsx';
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.toastService.show('¡Plantilla descargada con éxito!', 'success');
  }

  onDragOver(event: DragEvent) { 
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault(); 
    event.stopPropagation(); 
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.cargaMasivaService.validarYSeleccionarArchivo(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.cargaMasivaService.validarYSeleccionarArchivo(file);
    }
    event.target.value = '';
  }

  comenzarProcesamiento() {
    this.cargaMasivaService.iniciarProceso();
  }

  async confirmarSubida() {
    const productos = this.cargaMasivaService.productosProcesados();
    if (!productos) return;

    const confirm = await this.confirmService.ask({
      title: '¿Está seguro?',
      message: `Se crearán ${productos.length} productos nuevos en el catálogo actual.`,
      icon: 'info',
      type: 'info'
    });

    if (confirm) {
      const catalogoId = this.adminStore.catalogoId();
      this.cargaMasivaService.enviarDatosAlBackend(catalogoId, () => {
        this.volverAtras();
      });
    }
  }

  onUpdateProduct(original: ProductoImportado, actualizado: ProductoImportado) {
    this.cargaMasivaService.updateProductoIndividual(original, actualizado);
  }
}