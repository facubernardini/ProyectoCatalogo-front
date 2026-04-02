import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
	getCategoriasByCatalogo(catalogoId: number): Observable<CategoriaVendedor[]> {
		return this.http.get<CategoriaVendedor[]>(`${this.apiUrl}/catalogo/${catalogoId}`);
	}
}