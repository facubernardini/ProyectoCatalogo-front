import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment.dev';
import { LoginResponse } from 'src/app/core/models/auth.model';
import { Router } from '@angular/router';
import { TipoPlanEnum } from 'src/app/shared/enums/tipo-plan.enum';
import { Vendedor } from '../models/vendedor.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = `${environment.apiUrl}`;
  private router = inject(Router);

  public vendedorActual = signal<Vendedor | null>(this.obtenerVendedorDeStorage());

  public planActual = computed(() => {
    const vendedor = this.vendedorActual();
    
    if (!vendedor || !vendedor.suscripcion) {
      return TipoPlanEnum.SIN_PLAN;
    }

    const planString = vendedor.suscripcion.tipo_plan;
    return planString ? (planString as TipoPlanEnum) : TipoPlanEnum.SIN_PLAN;
  });

  public esPlanBasico = computed(() => {
    const plan = this.planActual();
    return plan === TipoPlanEnum.BASICO || plan === TipoPlanEnum.SIN_PLAN;
  });

  constructor(private http: HttpClient) {}

  private obtenerVendedorDeStorage(): Vendedor | null {
    const vendedorJson = localStorage.getItem('vendedor');
    if (!vendedorJson) return null;

    try {
      return JSON.parse(vendedorJson) as Vendedor;
    } catch (error) {
      console.error('Error al parsear el vendedor del localStorage', error);
      return null;
    }
  }

  actualizarVendedor(vendedor: Vendedor) {
    localStorage.setItem('vendedor', JSON.stringify(vendedor));
    this.vendedorActual.set(vendedor);
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        this.actualizarVendedor(res.vendedor);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('vendedor');
    this.vendedorActual.set(null);
    
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  refrescarSesion(): Observable<any> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return of(null);
    }

    return this.http.get<{vendedor: Vendedor}>(`${this.API_URL}/auth/me`).pipe(
      tap(res => {
        if (res && res.vendedor) {
          this.actualizarVendedor(res.vendedor);
        }
      })
    );
  }

  solicitarCodigo(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/solicitar-codigo`, { email });
  }

  solicitarCodigoRecuperacion(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/solicitar-codigo-recuperacion`, { email });
  }

  verificarCodigo(email: string, codigo: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/verificar-codigo`, { email, codigo });
  }

  cambiarPassword(passwords: { actual: string, nueva: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/cambiar-password`, passwords);
  }

  resetearPassword(payload: { email: string, codigoOTP: string, nuevaPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/reset-password`, payload);
  }
}