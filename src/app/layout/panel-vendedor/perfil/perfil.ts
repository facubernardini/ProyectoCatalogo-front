import { Component, computed, inject, signal } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { DatePipe } from '@angular/common';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { FormsModule } from '@angular/forms';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { SuscripcionEstado } from 'src/app/core/models/backoffice/suscripcion.model';
import { SUB_CONFIG } from 'src/app/core/data/suscripcion.data';

@Component({
  selector: 'app-perfil',
  imports: [Icon, DatePipe, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  public adminStore = inject(AdminStoreService);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  public SUB_CONFIG = SUB_CONFIG;
  public mostrarCambioPassword = signal(false);
  public loadingPassword = signal(false);

  estadoSuscripcion = SuscripcionEstado;

  public passwords = {
    actual: '',
    nueva: '',
    repetir: ''
  };

  diasRestantes = computed(() => {
    const fechaFin = this.adminStore.vendedor()?.suscripcion?.fecha_fin;
    if (!fechaFin) return null;

    const hoy = new Date();
    const fin = new Date(fechaFin);

    hoy.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const diferenciaMs = fin.getTime() - hoy.getTime();
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    
    return dias;
  });

  mejorarPlan() {
    const vendedor = this.adminStore.vendedor();
    const nombre = vendedor?.nombre_apellido;
    const planActual = vendedor?.suscripcion?.plan || 'Actual';
    
    const mensaje = `¡Hola! Soy ${nombre}. Me gustaría recibir más información para mejorar el plan ${planActual} de mi tienda.`;
    
    const numero = BRAND_DATA.contact.whatsapp.replace(/\D/g, ''); 
    
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  renovarSuscripcion() {
    throw new Error('Method not implemented.');
  }

  cambiarPlan(arg0: string) {
    throw new Error('Method not implemented.');
  }

  async guardarNuevaPassword() {
    if (!this.passwords.actual || !this.passwords.nueva || !this.passwords.repetir) {
      this.toastService.show('Por favor completá todos los campos.', 'error');
      return;
    }

    if (this.passwords.nueva.length < 8) {
      this.toastService.show('La nueva contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }

    if (this.passwords.nueva !== this.passwords.repetir) {
      this.toastService.show('Las contraseñas nuevas no coinciden.', 'error');
      return;
    }

    const confirm = await this.confirmService.ask({
      title: '¿Está seguro?',
      message: ``,
      icon: 'info',
      type: 'info'
    });

    if (confirm) {
      this.loadingPassword.set(true);

      this.authService.cambiarPassword({
        actual: this.passwords.actual,
        nueva: this.passwords.nueva
      }).subscribe({
        next: (res) => {
          this.loadingPassword.set(false);
          this.toastService.show(res.mensaje || '¡Contraseña actualizada con éxito!');
          
          this.passwords = { actual: '', nueva: '', repetir: '' };
          this.mostrarCambioPassword.set(false);
        },
        error: (err) => {
          this.loadingPassword.set(false);
          const mensajeError = err.error?.error || 'Hubo un problema al cambiar la contraseña.';
          this.toastService.show(mensajeError, 'error');
        }
      });
    }
  }
}
