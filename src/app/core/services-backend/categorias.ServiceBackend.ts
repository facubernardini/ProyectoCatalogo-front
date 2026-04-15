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
	private API_URL = `${environment.apiUrl}/categorias`; 

	// GET
	getCategoriasByCatalogo(catalogoId: number): Observable<CategoriaVendedor[]> {
		return this.http.get<CategoriaVendedor[]>(`${this.API_URL}/catalogo/${catalogoId}`);
	}

	getCategoriasBySlug(slug: string): Observable<CategoriaVendedor[]> {
		return this.http.get<CategoriaVendedor[]>(`${this.API_URL}/slug/${slug}`);
	}

	// POST
    createCategoria(categoria: Partial<CategoriaVendedor>): Observable<CategoriaVendedor> {
        return this.http.post<CategoriaVendedor>(this.API_URL, categoria);
    }

    updateCategoria(id: number, data: Partial<CategoriaVendedor>): Observable<CategoriaVendedor> {
        return this.http.patch<CategoriaVendedor>(`${this.API_URL}/${id}`, data);
    }

    deleteCategoria(id: number): Observable<any> {
        return this.http.delete<any>(`${this.API_URL}/${id}`);
    }
}