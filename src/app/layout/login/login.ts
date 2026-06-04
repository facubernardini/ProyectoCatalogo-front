import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { Toast } from "@shared/toast/toast";
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, Toast],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      correo: ['vendedor@test.com', [Validators.required, Validators.email]],
      password: ['password123', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        console.log("Login: ", res);
        if (res.vendedor.admin) {
          this.router.navigate(['/backoffice/inicio']);
        } else {
          this.adminStore.vendedor.set(res.vendedor);
          this.router.navigate(['/panel-vendedor/inicio']);
        }
      },
      error: (err) => {
        // Cuenta suspendida
        if (err.status === 403) {
          const mensajeSuspendido = err.error?.error || 'Tu cuenta ha sido suspendida. Por favor, comunícate con soporte.';
          this.toastService.show(mensajeSuspendido, 'error');
        } 
        // Credenciales inválidas
        else if (err.status === 401) {
          this.toastService.show('Correo o contraseña incorrectos.', 'error');
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
}