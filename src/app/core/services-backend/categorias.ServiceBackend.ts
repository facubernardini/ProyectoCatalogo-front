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
	private API_URL = environment.apiUrl;

	// GET
	getCategoriasByCatalogo(catalogoId: number): Observable<CategoriaVendedor[]> {
		return this.http.get<CategoriaVendedor[]>(`${this.API_URL}/seller/categorias/${catalogoId}`);
	}

	getCategoriasBySlug(slug: string): Observable<CategoriaVendedor[]> {
		return this.http.get<CategoriaVendedor[]>(`${this.API_URL}/public/categorias/${slug}`);
	}

	// POST
    createCategoria(categoria: Partial<CategoriaVendedor>): Observable<CategoriaVendedor> {
        return this.http.post<CategoriaVendedor>(`${this.API_URL}/seller/categorias`, categoria);
    }

    updateCategoria(id: number, data: Partial<CategoriaVendedor>): Observable<CategoriaVendedor> {
        return this.http.patch<CategoriaVendedor>(`${this.API_URL}/seller/categorias/${id}`, data);
    }

    deleteCategoria(id: number, accion?: 'mover' | 'eliminar', destinoId?: number): Observable<any> {
        let params = new HttpParams();

        if (accion) {
            params = params.set('accion', accion);
        }
        
        if (destinoId) {
            params = params.set('destinoId', destinoId.toString());
        }

        return this.http.delete<any>(`${this.API_URL}/seller/categorias/${id}`, { params });
    }
}