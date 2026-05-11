import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { MedioPago } from '../models/catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class MediosPagoServiceBackend {
    private http = inject(HttpClient);
    private API_URL = environment.apiUrl;

    getMediosDePago(): Observable<MedioPago[]> {
        return this.http.get<MedioPago[]>(`${this.API_URL}/seller/medios-pago`);
    }
}