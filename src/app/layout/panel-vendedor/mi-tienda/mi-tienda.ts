import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { CommonModule, Location } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { CatalogoService } from 'src/app/core/services-backend/catalogo.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { Catalogo, HorarioDia, TemaCatalogo } from 'src/app/core/models/catalogo.model';
import { FormsModule } from '@angular/forms';
import { ConfigSection } from "./config-section/config-section";
import { SafeHtmlPipe } from 'src/app/core/pipes/safe-html.pipe';
import { catchError, debounceTime, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { BRAND_DATA } from 'src/app/core/data/brand.data';

@Component({
  selector: 'app-mi-tienda',
  imports: [Icon, FormsModule, CommonModule, ConfigSection, SafeHtmlPipe],
  templateUrl: './mi-tienda.html',
  styleUrl: './mi-tienda.css',
})
export class MiTienda implements OnInit, OnDestroy {
  private location = inject(Location);

  public adminStore = inject(AdminStoreService);
  private catalogoService = inject(CatalogoService);
  private toastService = inject(ToastService);

  private cdr = inject(ChangeDetectorRef);

  BRAND_DATA = BRAND_DATA;
  
  catalogo = signal<Catalogo | null>(null);
  loading = signal(false);

  public slugDisponible = signal<boolean | null>(true);
  public validandoSlug = signal(false);
  private slugSubject = new Subject<string>();

  logoPreview: string | null = null;
  imagenLogoPendiente: File | null = null;

  MAX_SIZE_MB = 10;

  temasDisponibles = [
    { id: TemaCatalogo.MIDNIGHT, nombre: 'Midnight', bg: '#D1E9F6', accent: '#2E5A88' },
    { id: TemaCatalogo.ZAFIRO, nombre: 'Zafiro', bg: '#F8FAFC', accent: '#0EA5E9' },
    { id: TemaCatalogo.SUNSET, nombre: 'Sunset', bg: '#FFF7ED', accent: '#F97316' },
    { id: TemaCatalogo.FOREST, nombre: 'Forest', bg: '#F0FDF4', accent: '#16A34A' },
    { id: TemaCatalogo.SAKURA, nombre: 'Sakura', bg: '#FFF5F8', accent: '#F2A0AC' },
    { id: TemaCatalogo.MATCHA, nombre: 'Matcha', bg: '#F9FBF7', accent: '#A3B18A' },
    { id: TemaCatalogo.LAVANDA, nombre: 'Lavanda', bg: '#F8F7FF', accent: '#BDB2FF' },
    { id: TemaCatalogo.MINIMAL, nombre: 'Minimal', bg: '#FFFFFF', accent: '#171717' },
    { id: TemaCatalogo.TERRACOTA, nombre: 'Terracota', bg: '#FCF8F5', accent: '#D47A6A' },
    { id: TemaCatalogo.AQUA, nombre: 'Aqua', bg: '#F0FDFB', accent: '#2DD4BF' }
  ];

  ngOnInit() {
    this.configurarDebounceSlug();
    
    const storeData = this.adminStore.catalogo();
    if (storeData) {
      this.cargarDatosAlFormulario();
    }
  }

  ngOnDestroy() {
    this.slugSubject.complete();
  }

  private cargarDatosAlFormulario() {
    const storeData = this.adminStore.catalogo();
    if (!storeData) return;

    const copiaSegura: Catalogo = { ...storeData };

    if (!storeData.horarios || !Array.isArray(storeData.horarios) || storeData.horarios.length === 0) {
      copiaSegura.horarios = this.getHorariosBase();
    } else {
      copiaSegura.horarios = storeData.horarios.map(h => ({ ...h }));
    }

    copiaSegura.medios_pago = storeData.medios_pago ? storeData.medios_pago.map(m => ({ ...m })) : [];

    this.catalogo.set(copiaSegura);

    if (copiaSegura.slug) {
      this.slugDisponible.set(true);
    }
  }

  private getHorariosBase(): HorarioDia[] {
    const dias: HorarioDia['dia'][] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias.map(dia => ({
      dia,
      abierto: true,
      apertura: '09:00',
      cierre: '18:00'
    }));
  }

  isMedioSeleccionado(id: number): boolean {
    return this.catalogo()?.medios_pago?.some(m => m.id === id) ?? false;
  }

  toggleMedioPago(id: number) {
    this.catalogo.update(cat => {
      if (!cat) return cat;
      
      const seleccionado = cat.medios_pago.some(m => m.id === id);
      
      if (seleccionado) {
        cat.medios_pago = cat.medios_pago.filter(m => m.id !== id);
      } else {
        const medioGlobal = this.adminStore.mediosPago().find(m => m.id === id);
        if (medioGlobal) {
          cat.medios_pago = [...cat.medios_pago, medioGlobal];
        }
      }
      return { ...cat };
    });
  }

  cambiarTema(nuevoTema: TemaCatalogo) {
    this.catalogo.update(cat => {
      if (!cat) return cat;
      return { ...cat, tema: nuevoTema };
    });
  }

  async onLogoChange(event: any) {
    const file = event.target.files[0];
    
    if (!file) return;

    const MAX_SIZE_BYTES = this.MAX_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_SIZE_BYTES) {
      this.toastService.show(`La imagen es demasiado grande. Máximo ${this.MAX_SIZE_MB}MB.`, 'error');
    
      event.target.value = ''; 
      return;
    }

    try {
      const resizedFile = await this.redimensionarImagen(file, 256, 256);

      this.imagenLogoPendiente = resizedFile;
      
      this.logoPreview = URL.createObjectURL(resizedFile);

      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('Error procesando imagen:', error);
      this.toastService.show('Hubo un error al procesar el logo.', 'error');
    }
  }

  private redimensionarImagen(file: File, maxWidth: number, maxHeight: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas no soportado'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Error al comprimir la imagen'));
          }
        }, 'image/webp', 0.9);
      };
      
      img.onerror = (err) => reject(err);
    });
  }

  quitarLogo(event: Event) {
    event.stopPropagation(); 
    
    this.logoPreview = null;
    this.imagenLogoPendiente = null;
    
    this.catalogo.update(cat => {
      if (cat) {
        cat.logo_tienda = '';
      }
      return cat;
    });
    
    this.cdr.detectChanges();
  }

  private configurarDebounceSlug() {
    this.slugSubject.pipe(
      tap(() => {
        this.validandoSlug.set(false);
        this.slugDisponible.set(null);
      }),
      debounceTime(500),
      switchMap(slug => {
        if (!slug || slug.trim() === '') {
          return of({ esActual: false, disponible: null });
        }
        
        const slugGuardado = this.adminStore.catalogo()?.slug;
        if (slug === slugGuardado) {
          return of({ esActual: true, disponible: true });
        }

        this.validandoSlug.set(true);
        const idCatalogo = this.adminStore.catalogoId();
        
        return this.catalogoService.verificarSlugSeller(slug, idCatalogo).pipe(
          catchError((err) => {
            console.error('Error validando slug:', err);
            return of({ esActual: false, disponible: null, error: true });
          })
        ); 
      })
    ).subscribe({
      next: (res: any) => {
        this.validandoSlug.set(false);
        
        if (res && res.error) {
           this.slugDisponible.set(null);
           return;
        }

        if (res) {
          if ('esActual' in res && res.esActual) {
            this.slugDisponible.set(true);
          } else {
            this.slugDisponible.set(res.disponible);
          }
        }
      },
      error: (err) => {
        console.error('Suscripción muerta:', err);
        this.validandoSlug.set(false);
        this.slugDisponible.set(null);
      }
    });
  }

  onSlugChange(value: string) {
    if (!value || value.trim() === '') {
      this.catalogo.update(c => c ? { ...c, slug: '' } : c);
      this.slugSubject.next('');
      return;
    }
    
    const slugLimpio = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      
    this.catalogo.update(c => c ? { ...c, slug: slugLimpio } : c);
    
    this.slugSubject.next(slugLimpio);
  }

  validarCaracteresSlug(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.key.length > 1) {
      return; 
    }

    const patron = /^[a-zA-Z0-9-]$/;

    if (!patron.test(event.key)) {
      event.preventDefault();
    }
  }

  async guardarCambios(section: ConfigSection) {
    const dataActual = this.catalogo();

    if (!dataActual) {
      this.toastService.show('No hay datos para guardar', 'error');
      return;
    }

    if (!dataActual.slug || dataActual.slug.trim() === '') {
      this.toastService.show('La URL de la tienda no puede estar vacía.', 'error');
      return;
    }

    if (this.slugDisponible() === false) {
      this.toastService.show('La URL seleccionada ya está ocupada.', 'error');
      return;
    }
    
    if (this.validandoSlug()) {
      this.toastService.show('Espera a que termine la validación de la URL.', 'error');
      return;
    }

    dataActual.minimo_compra = dataActual.minimo_compra || 0;
    dataActual.descuento_en_efectivo = dataActual.descuento_en_efectivo || 0;

    if (dataActual.descuento_en_efectivo !== 0 && (dataActual.descuento_en_efectivo < 5 || dataActual.descuento_en_efectivo > 80)) {
      this.toastService.show('El descuento en efectivo debe ser un porcentaje entre 5 y 80.', 'error');
      return;
    }

    const diasInvalidos = dataActual.horarios.filter(item => 
      item.abierto && item.apertura >= item.cierre
    );

    if (diasInvalidos.length > 0) {
      const nombresDias = diasInvalidos.map(d => d.dia).join(', ');
      this.toastService.show(
        `Revisá los horarios de: ${nombresDias}. El cierre debe ser después de la apertura.`, 
        'error'
      );
      return;
    }
    
    this.loading.set(true);

    const upload$: Observable<{ url: string | null }> = this.imagenLogoPendiente 
      ? this.catalogoService.uploadLogoTienda(this.imagenLogoPendiente, dataActual.id) 
      : of({ url: null });

    upload$.pipe(
      switchMap((res: { url: string | null }) => {
        if (res.url) {
          dataActual.logo_tienda = res.url;
        }

        const payload = {
          ...dataActual,
          medios_pago_ids: dataActual.medios_pago.map(m => m.id)
        };
        
        return this.catalogoService.updateCatalogo(this.adminStore.catalogoId(), payload);
      })
    ).subscribe({
      next: (res: Catalogo) => {
        this.adminStore.catalogo.set(res);
        
        this.cargarDatosAlFormulario();
        
        this.toastService.show('Cambios guardados');
        
        this.imagenLogoPendiente = null;
        this.logoPreview = null;
        
        section.forceClose();
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('Error al guardar los cambios', 'error');
        this.loading.set(false);
      }
    });
  }

  resetearValores() {
    this.cargarDatosAlFormulario();
  }

  volverAtras() {
    this.location.back();
  }
}