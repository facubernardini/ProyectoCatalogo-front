import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { Toast } from "src/app/shared/components/toast/toast";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { BRAND_DATA } from 'src/app/core/data/brand.data';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, Toast, Icon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public BRAND_DATA = BRAND_DATA;
  
  loginForm: FormGroup;

  showPassword = signal(false);

  isLoading = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      const correo = this.loginForm.get('correo');
      const password = this.loginForm.get('password');

      if (correo?.hasError('required')) {
        this.toastService.show('Por favor, ingresá tu correo electrónico.', 'error');
      } else if (correo?.hasError('email')) {
        this.toastService.show('Ingresá un correo electrónico válido.', 'error');
      } else if (password?.hasError('required')) {
        this.toastService.show('Por favor, ingresá tu contraseña.', 'error');
      } else if (password?.hasError('minlength')) {
        this.toastService.show('La contraseña debe tener al menos 8 caracteres.', 'error');
      }
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.vendedor.admin) {
          this.router.navigate(['/backoffice/inicio']);
        } else {
          this.adminStore.vendedor.set(res.vendedor);
          this.router.navigate(['/panel-vendedor/inicio']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        // Credenciales inválidas o cuenta suspendida
        if (err.status === 401) {
          const mensajeError = err.error.message
          this.toastService.show(mensajeError, 'error');
        }
        else if (err.status === 429) {
          const mensajeError = err.error.message || 'Demasiados intentos. Intentá de nuevo en 1 minuto.';
          this.toastService.show(mensajeError, 'error');
        }
        // Error de Servidor
        else {
          this.toastService.show('Ocurrió un problema al intentar iniciar sesión.', 'error');
        }
      }
    });
  }

  recuperarPassword() {
    this.router.navigate(['/recovery']);
  }

  registrarme() {
    this.router.navigate(['/register']);
  }

}