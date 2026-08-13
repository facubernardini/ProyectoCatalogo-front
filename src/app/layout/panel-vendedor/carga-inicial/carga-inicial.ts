import { Component, inject, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from "src/app/shared/components/icon";
import { ToastService } from 'src/app/core/services/toast.service';
import { CardProducto } from "./card-producto/card-producto";
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CargaInicialService } from 'src/app/core/services/carga-inicial.service';
import { ProductoImportado } from 'src/app/core/models/carga-inicial.model';

@Component({
  selector: 'app-carga-inicial',
  standalone: true,
  imports: [Icon, CardProducto],
  templateUrl: './carga-inicial.html',
  styleUrl: './carga-inicial.css',
})
export class CargaInicial implements OnDestroy {
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private adminStore = inject(AdminStoreService);
  private router = inject(Router);
  
  public cargaInicialService = inject(CargaInicialService); 

  public isDragging = signal(false);

  ngOnDestroy(): void {
    this.cargaInicialService.reiniciarTodo();
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
      this.cargaInicialService.validarYSeleccionarArchivo(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.cargaInicialService.validarYSeleccionarArchivo(file);
    }
    event.target.value = '';
  }

  comenzarProcesamiento() {
    this.cargaInicialService.iniciarProceso();
  }

  async confirmarSubida() {
    const productos = this.cargaInicialService.productosProcesados();
    if (!productos) return;

    const confirm = await this.confirmService.ask({
      title: '¿Está seguro?',
      message: `Este proceso puede demorar hasta 1 minuto, no recargues la página.`,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      icon: 'info',
      type: 'info'
    });

    if (confirm) {
      const catalogoId = this.adminStore.catalogoId();
      
      this.cargaInicialService.enviarDatosAlBackend(catalogoId, () => {
        this.router.navigate(['/panel-vendedor/mis-productos']);
      });
    }
  }

  onUpdateProduct(original: ProductoImportado, actualizado: ProductoImportado) {
    this.cargaInicialService.updateProductoIndividual(original, actualizado);
  }
}