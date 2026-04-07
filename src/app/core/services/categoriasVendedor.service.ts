import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaVendedor } from '../models/categoriaVendedor.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
	private http = inject(HttpClient);
	private apiUrl = `${environment.apiUrl}/categorias`; 

	// Recupera las categorías asociadas a un catálogo específico
	getCategoriasByCatalogo(catalogoId: number, filtrarVacias: boolean = false): Observable<CategoriaVendedor[]> {
		const url = `${this.apiUrl}/catalogo/${catalogoId}`;
		
		// 1. Inicializamos HttpParams
		let queryParams = new HttpParams();
		
		// 2. Si hay que filtrar, lo agregamos
		if (filtrarVacias) {
			queryParams = queryParams.append('soloConProductos', 'true');
		}

		// 3. Pasamos las opciones. El genérico <CategoriaVendedor[]> es clave aquí.
		return this.http.get<CategoriaVendedor[]>(url, { params: queryParams });
	}
}