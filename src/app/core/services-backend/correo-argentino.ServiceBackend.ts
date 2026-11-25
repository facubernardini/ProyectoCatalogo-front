import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev';
import { ResponseCustomerIdDTO } from '../models/correo-argentino/user-validate.model';
import { PublicShippingRequestDTO, ResponseRatesDTO } from '../models/correo-argentino/rates.model';

@Injectable({
  providedIn: 'root'
})
export class CorreoArgentinoServiceBackend {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    validarUsuario(email: string, password: string): Observable<ResponseCustomerIdDTO> {
        return this.http.post<ResponseCustomerIdDTO>(`${this.apiUrl}/seller/micorreo/users/validate`, {
            email,
            password
        });
    }

    cotizarEnvio(slugTienda: string, payload: PublicShippingRequestDTO): Observable<ResponseRatesDTO> {
        return this.http.post<ResponseRatesDTO>(`${this.apiUrl}/public/micorreo/${slugTienda}/rates`, payload);
    }
    
}