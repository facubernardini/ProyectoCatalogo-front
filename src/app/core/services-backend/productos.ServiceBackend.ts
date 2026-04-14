import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/productos`;

	// -- GET --
	// Obtenemos productos por ID de catálogo - Panel Vendedor
	getProductosByCatalogo(catalogoId: number): Observable<Producto[]> {
		return this.http.get<Producto[]>(`${this.API_URL}/catalogo/${catalogoId}`);
	}

	// Obtenemos productos por SLUG de catálogo - Catalogo Publico
	getProductosBySlug(slug: string): Observable<Producto[]> {
		return this.http.get<Producto[]>(`${this.API_URL}/publico/${slug}`);
	}

	// -- POST --
	createProducto(producto: Producto): Observable<Producto> {
		// Enviamos el objeto producto completo al endpoint de creación
		return this.http.post<Producto>(this.API_URL, producto);
	}

	updateProducto(id: number, productoNuevo: Partial<Producto>): Observable<Producto> {
		// Usamos PATCH para actualizaciones parciales y concatenamos el ID en la URL
		return this.http.patch<Producto>(`${this.API_URL}/${id}`, productoNuevo);
	}

	deleteProducto(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/${id}`);
	}
}