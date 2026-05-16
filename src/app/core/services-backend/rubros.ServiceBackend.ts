import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Rubro } from '../models/catalogo.model';

@Injectable({
    providedIn: 'root'
})
export class RubroService {
    private http = inject(HttpClient);
	private API_URL = environment.apiUrl;

    obtenerRubros(): Observable<Rubro[]> {
        return this.http.get<Rubro[]>(`${this.API_URL}/public/rubros`);
    }
}