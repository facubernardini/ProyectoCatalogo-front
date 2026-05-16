import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { Catalogo, Rubro } from 'src/app/core/models/catalogo.model';
import { RegistroVendedorRequest } from 'src/app/core/models/vendedor.model';
import { RegisterService } from 'src/app/core/services-backend/register.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { Toast } from "@shared/toast/toast";
import { RubroService } from 'src/app/core/services-backend/rubros.ServiceBackend';

@Component({
  selector: 'app-register',
  imports: [Icon, FormsModule, Toast],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private registroService = inject(RegisterService);
  private rubroService = inject(RubroService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  
  public loading = signal(false);
  
  public pasoActual = signal<1 | 2>(1);

  public rubros = signal<Rubro[]>([]);

  public nombre = '';
  public apellido = '';
  public confirmPassword = '';

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
  }

  cargarRubros() {
    this.rubroService.obtenerRubros().subscribe({
      next: (data) => this.rubros.set(data),
      error: () => this.toastService.show('Error al cargar los rubros comerciales.')
    });
  }

  // Método para seleccionar un rubro desde la lista deslizable
  seleccionarRubro(id: number) {
    this.catalogo.rubro_id = id;
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
  }

  volverPaso() {
    this.pasoActual.set(1);
    history.back(); 
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    if (this.pasoActual() === 2) {
      this.pasoActual.set(1);
    }
  }

  registrarTienda() {

    if (!this.catalogo.nombre_tienda || !this.catalogo.slug) {
      this.toastService.show('Por favor, completá los datos de tu negocio.', 'error');
      return;
    }

    if (!this.catalogo.rubro_id) {
      this.toastService.show('Por favor, seleccioná un rubro para tu tienda.');
      return;
    }

    this.loading.set(true);

    this.vendedorReq.nombre_apellido = `${this.nombre.trim()} ${this.apellido.trim()}`;
    this.catalogo.slug = this.catalogo.slug?.toLowerCase().replace(/\s+/g, '-');

    const payloadFinal = {
      vendedor: this.vendedorReq,
      catalogo: this.catalogo
    };

    console.log('Payload validado:', payloadFinal);

    this.registroService.register(payloadFinal).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastService.show(res.mensaje);
        
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
