import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev';
import { RegistroVendedorRequest } from '../models/vendedor.model';
import { Catalogo } from '../models/catalogo.model';

export interface RegistroPayload {
	vendedor: RegistroVendedorRequest;
	catalogo: Partial<Catalogo>;
}

@Injectable({
	providedIn: 'root'
})
export class RegisterService {
	private http = inject(HttpClient);
	private API_URL = environment.apiUrl;

	register(payload: RegistroPayload): Observable<any> {
		return this.http.post<any>(`${this.API_URL}/register/registrar-tienda`, payload);
	}
}