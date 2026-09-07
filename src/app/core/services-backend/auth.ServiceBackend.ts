import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev';
import { LoginResponse } from 'src/app/core/models/auth.model';
import { Router } from '@angular/router';
import { TipoPlanEnum } from 'src/app/shared/enums/tipo-plan.enum';
import { Vendedor } from '../models/vendedor.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = `${environment.apiUrl}`;

  private router = inject(Router);

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('vendedor', JSON.stringify(res.vendedor));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('vendedor');
    
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  getVendedorActual(): Vendedor | null {
    const vendedorJson = localStorage.getItem('vendedor');
    if (!vendedorJson) return null;

    try {
      return JSON.parse(vendedorJson) as Vendedor;
    } catch (error) {
      console.error('Error al parsear el vendedor del localStorage', error);
      return null;
    }
  }

  getPlanActual(): TipoPlanEnum {
    const vendedor = this.getVendedorActual();

    if (!vendedor || !vendedor.suscripcion) {
      return TipoPlanEnum.SIN_PLAN;
    }

    const planString = vendedor.suscripcion.tipo_plan; 

    if (planString) {
      return planString as TipoPlanEnum;
    }

    return TipoPlanEnum.SIN_PLAN;
  }

  esPlanBasico(): boolean {
    return this.getPlanActual() === TipoPlanEnum.BASICO;
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