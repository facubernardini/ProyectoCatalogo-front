import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev';
import { LoginResponse } from 'src/app/core/models/auth.model';
import { Router } from '@angular/router';

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