import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services-backend/auth.ServiceBackend';
import { ToastService } from 'src/app/core/services/toast.service';
import { Toast } from "src/app/shared/components/toast/toast";
import { Icon } from "@shared/components/icon";
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { LoadingSpinner } from 'src/app/shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, Toast, Icon, LoadingSpinner],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public BRAND_DATA = BRAND_DATA;
  
  loginForm: FormGroup;

  showPassword = signal(false);
  isLoading = signal(false);
  buscandoToken = signal(true);

  constructor() {
    this.loginForm = this.fb.group({
      correo: ['vendedor@test.com', [Validators.required, Validators.email]],
      password: ['password123', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    const vendedorStr = localStorage.getItem('vendedor');
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const isExpired = this.route.snapshot.queryParams['expired'];

    if (isExpired) {
      this.router.navigate([], { queryParams: { expired: null }, queryParamsHandling: 'merge', replaceUrl: true });
      setTimeout(() => this.toastService.show('Tu sesión expiró. Ingresá nuevamente', 'error'), 100);
    }

    if (token && vendedorStr) {
      try {
        const vendedor = JSON.parse(vendedorStr);
        if (vendedor.admin) {
          this.router.navigateByUrl(returnUrl || '/backoffice/inicio', { replaceUrl: true });
        } else {
          this.router.navigateByUrl(returnUrl || '/panel-vendedor/inicio', { replaceUrl: true });
        }
      } catch (error) {
        this.buscandoToken.set(false);
      }
    } else {
      this.buscandoToken.set(false);
    }
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
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (res.vendedor.admin) {
          this.router.navigateByUrl(returnUrl || '/backoffice/inicio');
        } else {
          this.router.navigateByUrl(returnUrl || '/panel-vendedor/inicio');
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