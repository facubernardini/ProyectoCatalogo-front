import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs';
import { HistorialSuscripcion, PlanSuscripcion } from '../models/backoffice/suscripcion.model';

export interface RenovarSuscripcionPayload {
    vendedor_id: number;
    tipo_plan_id: number;
    modoRenovacion: 'rapida' | 'exacta';
    fechaExacta?: string;
    accion: string; 
}

@Injectable({
    providedIn: 'root'
})
export class SuscripcionesService {
    private http = inject(HttpClient);
    private API_URL = environment.apiUrl;

    getHistorialSuscripciones(): Observable<HistorialSuscripcion[]> {
        return this.http.get<HistorialSuscripcion[]>(`${this.API_URL}/admin/suscripciones`);
    }

    getPlanes(): Observable<PlanSuscripcion[]> {
        return this.http.get<PlanSuscripcion[]>(`${this.API_URL}/admin/planes`);
    }

    extenderSuscripcion(payload: RenovarSuscripcionPayload): Observable<any> {
        return this.http.post(`${this.API_URL}/admin/suscripciones/extender`, payload);
    }
}