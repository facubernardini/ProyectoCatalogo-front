import { Component, OnInit, computed, signal, inject, input, output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ProductoImagen } from 'src/app/core/models/producto.model';
import { Icon } from 'src/app/shared/components/icon';
import { ToastService } from 'src/app/core/services/toast.service';

export interface ImagenPreview {
  id_temporal: string;
  url_preview: string;
  file?: File;
  color_asociado: string | null;
  orden: number;
}

@Component({
  selector: 'app-galeria-imagenes',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder, FormsModule, Icon],
  templateUrl: './galeria-imagenes.html'
})
export class GaleriaImagenes implements OnInit {
  private toastService = inject(ToastService);
  
  imagenesIniciales = input<ProductoImagen[]>([]);
  coloresDisponibles = input<{ nombre: string, hex: string }[]>([]);

  imagenesActualizadas = output<ImagenPreview[]>();
  
  imagenesSignal = signal<ImagenPreview[]>([]);

  limiteFotos = 15;

  get imagenes(): ImagenPreview[] {
    return this.imagenesSignal();
  }

  ngOnInit() {
    const iniciales = this.imagenesIniciales();
    if (iniciales && iniciales.length > 0) {
      const imagenesMapeadas = iniciales.map(img => ({
        id_temporal: img.id.toString(),
        url_preview: img.url,
        file: undefined,
        color_asociado: img.color_asociado,
        orden: img.orden
      }));

      this.imagenesSignal.set(imagenesMapeadas);
      this.notificarCambios();
    }
  }

  imagenesAgrupadasPorColor = computed(() => {
    const listaActual = this.imagenesSignal();
    const grupos: { color: string | null; hex: string | null; imagenes: ImagenPreview[] }[] = [];
    const colores = this.coloresDisponibles();

    // 1. Grupo General
    const generalImages = listaActual.filter(img => !img.color_asociado);
    if (generalImages.length > 0 || colores.length === 0) {
      grupos.push({ color: null, hex: null, imagenes: generalImages });
    }

    // 2. Grupos por cada color
    colores.forEach(c => {
      const imgsColor = listaActual.filter(img => img.color_asociado === c.nombre);
      if (imgsColor.length > 0) {
        grupos.push({ color: c.nombre, hex: c.hex, imagenes: imgsColor });
      }
    });

    return grupos;
  });

  onFilesSelected(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files?.length) return;

    const todosLosArchivos = Array.from(inputEl.files);
    
    const archivosValidos = todosLosArchivos.filter(file => file.type.startsWith('image/'));
    
    if (archivosValidos.length < todosLosArchivos.length) {
      this.toastService.show('Formato no soportado. Por favor subí un archivo de imagen válido.', 'error');
    }

    if (archivosValidos.length === 0) {
      inputEl.value = '';
      return;
    }

    const nuevasImagenes = [...this.imagenesSignal()];
    const slotsDisponibles = this.limiteFotos - nuevasImagenes.length;

    if (slotsDisponibles <= 0) {
      this.toastService.show(`Has alcanzado el límite máximo de ${this.limiteFotos} fotos.`, 'error');
      inputEl.value = '';
      return;
    }

    const archivosPermitidos = archivosValidos.slice(0, slotsDisponibles);

    if (archivosValidos.length > slotsDisponibles) {
      this.toastService.show(`Solo se cargaron ${slotsDisponibles} fotos para no superar el límite.`, 'info');
    }

    archivosPermitidos.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      
      nuevasImagenes.push({
        id_temporal: Math.random().toString(36).substring(2, 9),
        url_preview: previewUrl,
        file: file,
        color_asociado: null,
        orden: nuevasImagenes.length + 1
      });
    });

    this.imagenesSignal.set(nuevasImagenes);
    this.actualizarOrdenesGlobales();
    inputEl.value = ''; 
  }

  eliminarImagenGlobal(imagenAEliminar: ImagenPreview) {
    const filtradas = this.imagenesSignal().filter(img => img.id_temporal !== imagenAEliminar.id_temporal);
    this.imagenesSignal.set(filtradas);
    this.actualizarOrdenesGlobales();
  }

  onDropGrupo(colorAsociado: string | null, event: CdkDragDrop<ImagenPreview[]>) {
    const grupoActual = this.imagenesSignal().filter(img => img.color_asociado === colorAsociado);
    
    moveItemInArray(grupoActual, event.previousIndex, event.currentIndex);

    const otrasImagenes = this.imagenesSignal().filter(img => img.color_asociado !== colorAsociado);
    
    if (colorAsociado === null) {
      this.imagenesSignal.set([...grupoActual, ...otrasImagenes]);
    } else {
      this.imagenesSignal.set([...otrasImagenes, ...grupoActual]);
    }

    this.actualizarOrdenesGlobales();
  }

  asignarColor(imagen: ImagenPreview, color: string | null) {
    const lista = this.imagenesSignal().map(img => {
      if (img.id_temporal === imagen.id_temporal) {
        return { ...img, color_asociado: color === 'null' ? null : color };
      }
      return img;
    });

    this.imagenesSignal.set(lista);
    this.actualizarOrdenesGlobales();
  }

  private actualizarOrdenesGlobales() {
    let contadorOrden = 1;
    const nuevoOrdenGlobal: ImagenPreview[] = [];

    this.imagenesAgrupadasPorColor().forEach(grupo => {
      grupo.imagenes.forEach(img => {
        img.orden = contadorOrden++;
        nuevoOrdenGlobal.push(img);
      });
    });

    this.imagenesSignal.set(nuevoOrdenGlobal);
    this.notificarCambios();
  }

  verificarLimite(event: Event) {
    if (this.imagenes.length >= this.limiteFotos) {
      event.preventDefault(); 
      
      this.toastService.show(`Alcanzaste el límite de imágenes (${this.limiteFotos})`, 'info');
    }
  }

  private notificarCambios() {
    this.imagenesActualizadas.emit(this.imagenesSignal());
  }
}