import { inject, Injectable, signal } from '@angular/core';
import { ToastService } from 'src/app/core/services/toast.service';
import * as XLSX from 'xlsx';
import { ProductoImportado } from 'src/app/core/models/carga-masiva.model';
import { BulkImportService } from 'src/app/core/services-backend/bulk-import.ServiceBackend';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CargaMasivaService {
  private toastService = inject(ToastService);
  private bulkImportService = inject(BulkImportService);
  private adminStore = inject(AdminStoreService);

  public selectedFile = signal<File | null>(null);
  public isProcessing = signal(false);
  public productosProcesados = signal<ProductoImportado[] | null>(null);

  public tieneProductosCargados = signal(() => (this.productosProcesados()?.length ?? 0) > 0);

  constructor() {}

  validarYSeleccionarArchivo(file: File) {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.toastService.show('Por favor, subí un archivo Excel válido (.xlsx o .xls)', 'error');
      return;
    }

    this.selectedFile.set(file);
    this.productosProcesados.set(null);
  }

  reiniciarTodo() {
    this.selectedFile.set(null);
    this.productosProcesados.set(null);
  }

  iniciarProceso() {
    const file = this.selectedFile();
    if (!file) return;

    this.isProcessing.set(true);
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawData.length === 0) {
          this.toastService.show('El archivo Excel está vacío o no tiene el formato correcto.', 'error');
          this.isProcessing.set(false);
          return;
        }

        const productosMap = new Map<string, ProductoImportado>();
        const filasConErrores: string[] = [];

        rawData.forEach((row: any, index: number) => {
          const filaExcel = index + 2;

          const nombre = String(row['Nombre_Producto'] || '').trim();
          const descripcion = String(row['Descripción'] || '').trim();
          const marca = String(row['Marca'] || '').trim();
          const categoria = String(row['Categoría'] || '').trim();
          const fotoUrl = String(row['Foto_URL'] || '').trim();
          
          let rawUnidad = String(row['Unidad_de_Venta'] || '').trim();
          let unidadVenta = rawUnidad.charAt(0).toUpperCase() + rawUnidad.slice(1).toLowerCase();
          
          if (unidadVenta === '') unidadVenta = 'Unidad';

          let precioRaw = row['Precio'];
          if (typeof precioRaw === 'string') {
            precioRaw = precioRaw.replace('$', '').replace(',', '.').trim();
          }
          const precio = parseFloat(precioRaw);

          if (!nombre && !categoria && isNaN(precio)) return; 

          if (!nombre) {
            filasConErrores.push(`Fila ${filaExcel}: Falta el nombre del producto.`);
            return;
          }
          if (isNaN(precio) || precio < 0) {
            filasConErrores.push(`Fila ${filaExcel}: El precio de "${nombre}" no es válido.`);
            return;
          }

          const productoKey = nombre.toLowerCase();

          if (!productosMap.has(productoKey)) {
            if (!categoria) {
              filasConErrores.push(`Fila ${filaExcel}: Falta la categoría de "${nombre}".`);
              return;
            }

            productosMap.set(productoKey, {
              nombre: nombre,
              descripcion: descripcion,
              marca: marca,
              categoria: categoria,
              foto_url: fotoUrl,
              presentaciones: []
            });
          }

          const productoGuardado = productosMap.get(productoKey)!;
          productoGuardado.presentaciones.push({
            unidad_venta: unidadVenta,
            precio: precio
          });
        });

        if (filasConErrores.length > 0) {
          this.toastService.show(filasConErrores[0], 'error'); 
          this.isProcessing.set(false);
          return;
        }

        const productosLimpios = Array.from(productosMap.values());

        if (productosLimpios.length === 0) {
          this.toastService.show('No encontramos productos válidos para cargar.', 'error');
          this.isProcessing.set(false);
          return;
        }

        this.isProcessing.set(false);
        this.productosProcesados.set(productosLimpios); 
        this.toastService.show(`¡${productosLimpios.length} productos procesados correctamente!`, 'success');
      } catch (error) {
        console.error('Error al procesar el Excel:', error);
        this.toastService.show('Ocurrió un error al leer el archivo. Verificá que no esté dañado.', 'error');
        this.isProcessing.set(false);
      }
    };

    reader.onerror = () => {
      this.toastService.show('Ocurrió un error al intentar leer el archivo.', 'error');
      this.isProcessing.set(false);
    };

    reader.readAsArrayBuffer(file);
  }

  enviarDatosAlBackend(catalogoId: number, onSuccess: () => void) {
    const productos = this.productosProcesados();
    if (!productos) return;

    this.isProcessing.set(true);

    this.bulkImportService.bulkImportProductos(catalogoId, productos)
      .pipe(
        finalize(() => this.isProcessing.set(false))
      )
      .subscribe({
        next: (respuesta) => {
          this.toastService.show(`¡Listo! Se crearon ${respuesta.estadisticas.productos_creados_exito} productos nuevos.`, 'success');
          this.adminStore.cargarDatosPanelVendedor(catalogoId);
          onSuccess();
        },
        error: (err) => {
          this.toastService.show(err.error?.error || 'Ocurrió un error al subir el catálogo', 'error');
          console.error('Error Bulk Import:', err);
        }
      });
  }

  updateProductoIndividual(original: ProductoImportado, actualizado: ProductoImportado) {
    this.productosProcesados.update(productosArray => {
      if (!productosArray) return null;

      const index = productosArray.indexOf(original);

      if (index === -1) {
        console.error("No se pudo encontrar el producto original para actualizar.");
        return productosArray;
      }

      const nuevoArray = [...productosArray];
      nuevoArray[index] = actualizado;
      return nuevoArray;
    });
  }
}