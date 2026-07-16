import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { Catalogo, Rubro } from 'src/app/core/models/catalogo.model';
import { RegistroVendedorRequest } from 'src/app/core/models/vendedor.model';
import { RegisterService } from 'src/app/core/services-backend/register.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { Toast } from "src/app/shared/components/toast/toast";
import { RubroService } from 'src/app/core/services-backend/rubros.ServiceBackend';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [Icon, FormsModule, Toast],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  private registroService = inject(RegisterService);
  private authService = inject(AuthService);
  private rubroService = inject(RubroService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  public BRAND_DATA = BRAND_DATA;
  
  public loading = signal(false);
  showConfirmPassword = signal(false);
  
  public pasoActual = signal<1 | 2 | 3>(1);

  public slugDisponible = signal<boolean | null>(null);
  public validandoSlug = signal(false);
  private slugSubject = new Subject<string>();

  public rubros = signal<Rubro[]>([]);
  public isRubroDropdownOpen = signal(false);
  public rubroSeleccionadoNombre = signal<string | null>(null);

  public nombre = '';
  public apellido = '';
  public confirmPassword = '';
  
  public codigoOTP = '';

  public vendedorReq: RegistroVendedorRequest = {
    nombre_apellido: '',
    correo: '',
    password: ''
  };

  public catalogo: Partial<Catalogo> = {
    nombre_tienda: '',
    slug: '',
    rubro_id: 0,
    minimo_compra: 0,
    ofrece_envio: false,
    descuento_en_efectivo: 0,
    logo_tienda: '',
    horarios: [],
    medios_pago: []
  };

  ngOnInit() {
    this.cargarRubros();
    this.recuperarProgreso();
    this.configurarDebounceSlug();
  }

  ngOnDestroy() {
    this.slugSubject.complete();
  }

  cargarRubros() {
    this.rubroService.obtenerRubros().subscribe({
      next: (data) => this.rubros.set(data),
      error: () => this.toastService.show('Error al cargar los rubros comerciales.')
    });
  }

  toggleRubroDropdown() {
    this.isRubroDropdownOpen.update(val => !val);
  }

  seleccionarRubroCustom(rubro: Rubro) {
    this.catalogo.rubro_id = rubro.id;
    this.rubroSeleccionadoNombre.set(rubro.nombre);
    this.isRubroDropdownOpen.set(false);
  }

  avanzarPaso() {
    if (!this.nombre || !this.apellido || !this.vendedorReq.correo || 
        !this.vendedorReq.password || !this.confirmPassword) {
      this.toastService.show('Por favor, completá todos tus datos personales.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.vendedorReq.correo)) {
      this.toastService.show('El formato del correo electrónico no es válido.', 'error');
      return;
    }

    if (this.vendedorReq.password.length < 8) {
      this.toastService.show('La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }

    if (this.vendedorReq.password !== this.confirmPassword) {
      this.toastService.show('Las contraseñas no coinciden. Verificalas.', 'error');
      return;
    }

    this.pasoActual.set(2);
    history.pushState({ paso: 2 }, '', '');

    this.guardarProgreso();
  }

  volverPaso() {
    if (this.pasoActual() === 3) {
      this.pasoActual.set(2);
    } else {
      this.pasoActual.set(1);
    }

    history.back(); 
    this.guardarProgreso();
  }

  private configurarDebounceSlug() {
    this.slugSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(slug => {
        if (!slug || slug.trim() === '') {
          this.slugDisponible.set(null);
          this.validandoSlug.set(false);
          return of(null);
        }
        this.validandoSlug.set(true);
        return this.registroService.verificarSlugPublico(slug);
      })
    ).subscribe({
      next: (res) => {
        this.validandoSlug.set(false);
        if (res) {
          this.slugDisponible.set(res.disponible);
        } else {
          this.slugDisponible.set(null); 
        }
      },
      error: () => {
        this.validandoSlug.set(false);
        this.slugDisponible.set(null);
      }
    });

    if (this.catalogo.slug) {
      this.slugSubject.next(this.catalogo.slug);
    }
  }

  onSlugChange(value: string) {
    this.slugDisponible.set(null);
    
    if (!value || value.trim() === '') {
      this.catalogo.slug = '';
      this.validandoSlug.set(false);
      this.slugSubject.next('');
      return;
    }
    
    const slugLimpio = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
      
    this.catalogo.slug = slugLimpio;
    this.slugSubject.next(slugLimpio);
  }

  generarSlug() {
    if (!this.catalogo.nombre_tienda || this.catalogo.nombre_tienda.trim() === '') {
      this.catalogo.slug = '';
      this.slugDisponible.set(null);
      this.validandoSlug.set(false);
      this.slugSubject.next('');
      return;
    }

    this.catalogo.slug = this.catalogo.nombre_tienda
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    this.slugDisponible.set(null);
    this.slugSubject.next(this.catalogo.slug);
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    if (this.pasoActual() === 3) {
      this.pasoActual.set(2);
    } else if (this.pasoActual() === 2) {
      this.pasoActual.set(1);
    }
  }

  solicitarCodigo() {
    if (!this.catalogo.nombre_tienda || this.catalogo.nombre_tienda.trim() === '') {
      this.toastService.show('Por favor, ingresá el nombre de tu negocio.', 'error');
      return;
    }

    if (!this.catalogo.slug || this.catalogo.slug.trim() === '' || this.slugDisponible() !== true) {
      this.toastService.show('El enlace de la tienda no es válido o está ocupado.', 'error');
      return;
    }

    if (!this.catalogo.rubro_id || this.catalogo.rubro_id === 0) {
      this.toastService.show('Por favor, seleccioná un rubro para tu tienda.', 'error');
      return;
    }

    this.loading.set(true);

    this.authService.solicitarCodigo(this.vendedorReq.correo).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastService.show(res.mensaje || 'Te enviamos el código a tu correo.');
        
        this.pasoActual.set(3);
        history.pushState({ paso: 3 }, '', '');

        this.guardarProgreso();
      },
      error: (err) => {
        this.loading.set(false);
        const mensajeError = err.error?.error || 'Error al enviar el código de verificación.';
        this.toastService.show(mensajeError, 'error');
      }
    });
  }

  verificarYRegistrar() {
    if (this.codigoOTP.length !== 6) {
      this.toastService.show('El código debe tener exactamente 6 dígitos.', 'error');
      return;
    }

    this.loading.set(true);

    this.authService.verificarCodigo(this.vendedorReq.correo, this.codigoOTP).subscribe({
      next: (res) => {
        this.ejecutarRegistroDefinitivo();
      },
      error: (err) => {
        this.loading.set(false);
        const mensajeError = err.error?.error || 'El código es incorrecto o expiró.';
        this.toastService.show(mensajeError, 'error');
      }
    });
  }

  private ejecutarRegistroDefinitivo() {
    this.vendedorReq.nombre_apellido = `${this.nombre.trim()} ${this.apellido.trim()}`;
    this.catalogo.slug = this.catalogo.slug?.toLowerCase().replace(/\s+/g, '-');

    const payloadFinal = {
      vendedor: this.vendedorReq,
      catalogo: this.catalogo
    };

    this.registroService.register(payloadFinal).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastService.show(res.mensaje || '¡Tienda creada con éxito!');
        
        this.limpiarProgreso();
        
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const mensajeError = err.error?.error || 'Ocurrió un error al registrar la tienda. Intentá de nuevo.';
        this.toastService.show(mensajeError, 'error');
      }
    });
  }

  // Storage por seguridad si recarga la pagina
  private guardarProgreso() {
    const progreso = {
      pasoActual: this.pasoActual(),
      nombre: this.nombre,
      apellido: this.apellido,
      confirmPassword: this.confirmPassword,
      vendedorReq: this.vendedorReq,
      catalogo: this.catalogo,
      rubroSeleccionadoNombre: this.rubroSeleccionadoNombre()
    };
    sessionStorage.setItem('registro_progreso', JSON.stringify(progreso));
  }

  private recuperarProgreso() {
    const progresoGuardado = sessionStorage.getItem('registro_progreso');
    if (progresoGuardado) {
      try {
        const data = JSON.parse(progresoGuardado);
        this.nombre = data.nombre || '';
        this.apellido = data.apellido || '';
        this.confirmPassword = data.confirmPassword || '';
        this.vendedorReq = data.vendedorReq;
        this.catalogo = data.catalogo;
        
        if (data.rubroSeleccionadoNombre) {
          this.rubroSeleccionadoNombre.set(data.rubroSeleccionadoNombre);
        }
        
        this.pasoActual.set(data.pasoActual || 1);
      } catch (e) {
        console.error('Error al leer el progreso', e);
        sessionStorage.removeItem('registro_progreso');
      }
    }
  }

  private limpiarProgreso() {
    sessionStorage.removeItem('registro_progreso');
  }
}