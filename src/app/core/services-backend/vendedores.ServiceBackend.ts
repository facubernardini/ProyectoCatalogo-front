import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev';
import { VendedorBackoffice } from '../models/backoffice/vendedorBackoffice.model';

@Injectable({ providedIn: 'root' })
export class VendedorService {
	private http = inject(HttpClient);
	private API_URL = environment.apiUrl;

	getVendedores(): Observable<VendedorBackoffice[]> {
		return this.http.get<VendedorBackoffice[]>(`${this.API_URL}/admin/vendedores`);
	}

	cambiarEstadoVendedor(vendedorId: number): Observable<any> {
		return this.http.patch(`${this.API_URL}/admin/vendedores/cambiar-estado/${vendedorId}`, {});
	}
}