import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { VendedorBackoffice } from '../models/backoffice/vendedorBackoffice.model';

@Injectable({ providedIn: 'root' })
export class VendedorService {
	private http = inject(HttpClient);
	private API_URL = environment.apiUrl;

	getVendedores(): Observable<VendedorBackoffice[]> {
		return this.http.get<VendedorBackoffice[]>(`${this.API_URL}/admin/vendedores`);
	}
}