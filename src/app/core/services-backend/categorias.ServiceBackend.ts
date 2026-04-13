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
	// Recupera las categorías asociadas a un catálogo específico
	getCategoriasByCatalogo(catalogoId: number, filtrarInactivasYVacias: boolean = false): Observable<CategoriaVendedor[]> {
		const url = `${this.API_URL}/catalogo/${catalogoId}`;
		
		// 1. Inicializamos HttpParams
		let queryParams = new HttpParams();
		
		// 2. Si hay que filtrar, lo agregamos
		if (filtrarInactivasYVacias) {
			queryParams = queryParams.append('soloActivaYConProductos', 'true');
		}

		// 3. Pasamos las opciones. El genérico <CategoriaVendedor[]> es clave aquí.
		return this.http.get<CategoriaVendedor[]>(url, { params: queryParams });
	}

	// POST
    createCategoria(nombre: string, catalogoId: number): Observable<CategoriaVendedor> {
        return this.http.post<CategoriaVendedor>(this.API_URL, { 
            nombre, 
            catalogo_id: catalogoId
        });
    }

    // 2. Editar: Solo necesitamos el ID en la URL y el nuevo nombre en el body
    updateCategoria(id: number, data: { nombre: string }): Observable<CategoriaVendedor> {
        return this.http.patch<CategoriaVendedor>(`${this.API_URL}/${id}`, data);
    }

    // 3. Eliminar: Solo el ID en la URL. Suele devolver un mensaje o el objeto eliminado
    deleteCategoria(id: number): Observable<any> {
        return this.http.delete<any>(`${this.API_URL}/${id}`);
    }
}