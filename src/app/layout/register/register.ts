import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { Catalogo, Rubro } from 'src/app/core/models/catalogo.model';
import { RegistroVendedorRequest } from 'src/app/core/models/vendedor.model';
import { RegisterService } from 'src/app/core/services-backend/register.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { Toast } from "src/app/shared/components/toast/toast";
import { RubroService } from 'src/app/core/services-backend/rubros.ServiceBackend';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [RouterLink, Icon, FormsModule, Toast],
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

  public correoDisponible = signal<boolean | null>(null);
  public validandoCorreo = signal(false);
  private correoSubject = new Subject<string>();
  public correoErrorMensaje = signal<string | null>(null);

  public rubros = signal<Rubro[]>([]);
  public isRubroDropdownOpen = signal(false);
  public rubroSeleccionadoNombre = signal<string | null>(null);

  public nombre = '';
  public apellido = '';
  public confirmPassword = '';
  
  public codigoOTP = '';

  aceptaTerminos = false;

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
    this.configurarDebounceSlug();
    this.configurarDebounceCorreo();
  }

  ngOnDestroy() {
    this.slugSubject.complete();
    this.correoSubject.complete();
  }

  verPlanes() {
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        const seccionPrecios = document.getElementById('precios');
        if (seccionPrecios) {
          seccionPrecios.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });
  }

  cargarRubros() {
    this.rubroService.obtenerRubros().subscribe({
      next: (data) => this.rubros.set(data),
      error: () => console.error('Error al cargar rubros')
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
    if (!this.nombre || !this.apellido) {
      this.toastService.show('Por favor, completá tu nombre y apellido.', 'error');
      return;
    }

    if (!this.vendedorReq.correo) {
      this.toastService.show('Por favor, agregá un correo electrónico.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.vendedorReq.correo)) {
      this.toastService.show('El formato del correo electrónico no es válido.', 'error');
      return;
    }

    if (this.correoDisponible() === false) {
      this.toastService.show('El correo ingresado ya está en uso.', 'error');
      return;
    }
    
    if (this.validandoCorreo()) {
      this.toastService.show('Verificando disponibilidad del correo. Esperá un momento.');
      return;
    }

    if (!this.vendedorReq.password || !this.confirmPassword) {
      this.toastService.show('Por favor, creá tu contraseña.', 'error');
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
  }

  volverPaso() {
    if (this.pasoActual() === 3) {
      this.pasoActual.set(2);
    } else {
      this.pasoActual.set(1);
    }

    history.back();
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

  validarCaracteresSlug(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.key.length > 1) {
      return; 
    }

    const patron = /^[a-zA-Z0-9-]$/;

    if (!patron.test(event.key)) {
      event.preventDefault();
    }
  }

  private configurarDebounceCorreo() {
    this.correoSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(correo => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!correo || correo.trim() === '' || !emailRegex.test(correo)) {
          this.correoDisponible.set(null);
          this.validandoCorreo.set(false);
          this.correoErrorMensaje.set(null);
          return of(null);
        }
        
        this.validandoCorreo.set(true);
        this.correoErrorMensaje.set(null);
        
        return this.registroService.verificarDisponibilidadCorreo(correo).pipe(
          catchError(err => {
            this.validandoCorreo.set(false);
            this.correoDisponible.set(false);
            
            if (err.status === 409) {
              this.correoErrorMensaje.set(err.error.error || 'Ya existe una cuenta registrada con ese correo.');
            } else {
              this.correoErrorMensaje.set('Error al verificar el correo.');
            }
            return of(null);
          })
        );
      })
    ).subscribe((res: any) => {
      if (res) {
        this.validandoCorreo.set(false);
        this.correoDisponible.set(true);
        this.correoErrorMensaje.set(null);
      }
    });
  }

  onCorreoChange(value: string) {
    this.vendedorReq.correo = value;
    this.correoDisponible.set(null);
    this.correoErrorMensaje.set(null);
    
    this.correoSubject.next(value);
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

    if (this.validandoSlug()) {
      this.toastService.show('Verificando disponibilidad del enlace. Esperá un momento.', 'error');
      return;
    }

    if (!this.catalogo.slug || this.catalogo.slug.trim() === '' || this.slugDisponible() !== true) {
      this.toastService.show('El enlace de la tienda no es válido o ya está ocupado.', 'error');
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
        
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const mensajeError = err.error?.error || 'Ocurrió un error al registrar la tienda. Intentá de nuevo.';
        this.toastService.show(mensajeError, 'error');
      }
    });
  }

}