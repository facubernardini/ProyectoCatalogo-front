import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}/productos`;

	// Obtenemos productos por ID de catálogo - Panel Vendedor
	getProductosByCatalogo(catalogoId: number): Observable<Producto[]> {
		return this.http.get<Producto[]>(`${this.API_URL}/catalogo/${catalogoId}`);
	}

	// Obtenemos productos por SLUG de catálogo - Catalogo Publico
	getProductosBySlug(slug: string): Observable<Producto[]> {
		return this.http.get<Producto[]>(`${this.API_URL}/publico/${slug}`);
	}

	createProducto(productoNuevo: Producto): Observable<Producto> {
		return this.http.get<Producto>(`${this.API_URL}/publico`);
	}

	updateProducto(id: number, productoNuevo: Producto): Observable<Producto> {
		return this.http.get<Producto>(`${this.API_URL}/publico`);
	}
}