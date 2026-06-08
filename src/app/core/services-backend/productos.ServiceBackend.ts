import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoService {
	private http = inject(HttpClient);
	private API_URL = environment.apiUrl;

	// -- GET --
	// Obtenemos productos por ID de catálogo - Panel Vendedor
	getProductosByCatalogo(catalogoId: number): Observable<Producto[]> {
		return this.http.get<Producto[]>(`${this.API_URL}/seller/productos/${catalogoId}`);
	}

	// Obtenemos productos por SLUG de catálogo - Catalogo Publico
	getProductosBySlug(slug: string): Observable<Producto[]> {
		return this.http.get<Producto[]>(`${this.API_URL}/public/productos/${slug}`);
	}

	// -- POST --
	createProducto(producto: Producto): Observable<Producto> {
		return this.http.post<Producto>(`${this.API_URL}/seller/productos`, producto);
	}

	updateProducto(id: number, productoNuevo: Partial<Producto>): Observable<Producto> {
		return this.http.patch<Producto>(`${this.API_URL}/seller/productos/${id}`, productoNuevo);
	}

	deleteProducto(id: number): Observable<void> {
		return this.http.delete<void>(`${this.API_URL}/seller/productos/${id}`);
	}

	uploadImagen(file: File, nombreCatalogo: string): Observable<{ url: string }> {
		const formData = new FormData();
		formData.append('nombreCatalogo', nombreCatalogo);
		formData.append('foto', file);
		
		return this.http.post<{ url: string }>(`${this.API_URL}/seller/productos/upload-imagen`, formData);
	}
}