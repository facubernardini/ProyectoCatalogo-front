import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';
import { Toast } from "src/app/shared/components/toast/toast";
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [ReactiveFormsModule, Toast],
  templateUrl: './recovery-password.html'
})
export class RecoveryPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Estados
  public pasoActual = signal<1 | 2>(1);
  public loading = signal(false);
  public emailEnviado = '';

  // Formulario del Paso 1
  public emailForm = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  // Formulario del Paso 2
  public resetForm = this.fb.nonNullable.group({
    codigoOTP: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  pedirCodigo() {
    if (this.emailForm.invalid) {
      this.toastService.show('Ingresá un correo válido.', 'error');
      return;
    }

    this.loading.set(true);
    const email = this.emailForm.getRawValue().correo;

    this.authService.solicitarCodigoRecuperacion(email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.emailEnviado = email;
        this.toastService.show('Código enviado a tu correo.');
        this.pasoActual.set(2);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.show(err.error?.error || 'Hubo un error al enviar el código.', 'error');
      }
    });
  }

  restablecerPassword() {
    if (this.resetForm.invalid) {
      this.toastService.show('Verificá los campos ingresados.', 'error');
      return;
    }

    const { codigoOTP, password, confirmPassword } = this.resetForm.getRawValue();

    if (password !== confirmPassword) {
      this.toastService.show('Las contraseñas no coinciden.', 'error');
      return;
    }

    this.loading.set(true);

    const payload = {
      email: this.emailEnviado,
      codigoOTP: codigoOTP,
      nuevaPassword: password
    };

    // Llama al endpoint "/reset-password" (el que combina la verificación y el cambio)
    this.authService.resetearPassword(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastService.show('¡Contraseña actualizada con éxito!');
        // Redirige al login para que entre con su nueva clave
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.show(err.error?.error || 'El código es incorrecto o expiró.', 'error');
      }
    });
  }

  volver() {
    // Si está en el paso 2, el botón lo devuelve al paso 1
    if (this.pasoActual() === 2) {
      this.pasoActual.set(1);
      this.resetForm.reset();
    } else {
      // Si está en el paso 1, lo devuelve a la pantalla de login
      this.router.navigate(['/login']);
    }
  }
}