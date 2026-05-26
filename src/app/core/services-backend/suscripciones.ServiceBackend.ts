import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HistorialSuscripcion } from '../models/backoffice/suscripcion.model';

@Injectable({
    providedIn: 'root'
})
export class SuscripcionesService {
    private http = inject(HttpClient);
	private API_URL = environment.apiUrl;

    getHistorialSuscripciones(): Observable<HistorialSuscripcion[]> {
        return this.http.get<HistorialSuscripcion[]>(`${this.API_URL}/admin/suscripciones`);
    }

}