import { Component, Input, Output, EventEmitter, OnInit, computed, signal } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ProductoImagen } from 'src/app/core/models/producto.model';
import { Icon } from 'src/app/shared/components/icon';

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
  @Input() imagenesIniciales: ProductoImagen[] = [];
  @Input() coloresDisponibles: { nombre: string, hex: string }[] = [];
  
  @Output() imagenesActualizadas = new EventEmitter<ImagenPreview[]>();

  imagenesSignal = signal<ImagenPreview[]>([]);

  get imagenes(): ImagenPreview[] {
    return this.imagenesSignal();
  }
  set imagenes(val: ImagenPreview[]) {
    this.imagenesSignal.set(val);
  }

  ngOnInit() {
    if (this.imagenesIniciales && this.imagenesIniciales.length > 0) {
      const imagenesMapeadas = this.imagenesIniciales.map(img => ({
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

    // 1. Grupo General (sin color asignado o null)
    const generalImages = listaActual.filter(img => !img.color_asociado);
    if (generalImages.length > 0 || this.coloresDisponibles.length === 0) {
      grupos.push({ color: null, hex: null, imagenes: generalImages });
    }

    // 2. Grupos por cada color disponible
    this.coloresDisponibles.forEach(c => {
      const imgsColor = listaActual.filter(img => img.color_asociado === c.nombre);
      if (imgsColor.length > 0) {
        grupos.push({ color: c.nombre, hex: c.hex, imagenes: imgsColor });
      }
    });

    return grupos;
  });

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const nuevasImagenes = [...this.imagenesSignal()];

    Array.from(input.files).forEach((file) => {
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
    input.value = ''; 
  }

  eliminarImagenGlobal(imagenAEliminar: ImagenPreview) {
    const filtradas = this.imagenesSignal().filter(img => img.id_temporal !== imagenAEliminar.id_temporal);
    this.imagenesSignal.set(filtradas);
    this.actualizarOrdenesGlobales();
  }

  // Evento que dispara Angular CDK al soltar una tarjeta dentro de su respectivo grupo
  onDropGrupo(colorAsociado: string | null, event: CdkDragDrop<ImagenPreview[]>) {
    // Obtenemos el grupo actual
    const grupoActual = this.imagenesSignal().filter(img => img.color_asociado === colorAsociado);
    
    // Movemos el elemento en el array local del grupo
    moveItemInArray(grupoActual, event.previousIndex, event.currentIndex);

    // Reconstruimos la lista completa fusionando los cambios
    const otrasImagenes = this.imagenesSignal().filter(img => img.color_asociado !== colorAsociado);
    
    // Si el grupo era el general (null)
    if (colorAsociado === null) {
      this.imagenesSignal.set([...grupoActual, ...otrasImagenes]);
    } else {
      // Mantenemos el orden de los grupos y actualizamos el modificado
      this.imagenesSignal.set([...otrasImagenes, ...grupoActual]);
    }

    this.actualizarOrdenesGlobales();
  }

  // Asignamos el color y recalculamos la posición en los grupos
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

    // Recorremos los grupos estructurados para asignar el 'orden' secuencial
    this.imagenesAgrupadasPorColor().forEach(grupo => {
      grupo.imagenes.forEach(img => {
        img.orden = contadorOrden++;
        nuevoOrdenGlobal.push(img);
      });
    });

    this.imagenesSignal.set(nuevoOrdenGlobal);
    this.notificarCambios();
  }

  private notificarCambios() {
    this.imagenesActualizadas.emit(this.imagenesSignal());
  }
}