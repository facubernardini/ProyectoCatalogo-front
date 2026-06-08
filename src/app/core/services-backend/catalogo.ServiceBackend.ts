import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Catalogo } from '../models/catalogo.model';
import { CatalogoBackoffice } from '../models/backoffice/catalogoBackoffice.mode';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
	private http = inject(HttpClient);
	private API_URL = `${environment.apiUrl}`; 

	getCatalogoBySlug(slug: string): Observable<Catalogo> {
		return this.http.get<Catalogo>(`${this.API_URL}/public/catalogos/${slug}`);
	}

	getCatalogoById(id: number): Observable<Catalogo> {
        return this.http.get<Catalogo>(`${this.API_URL}/seller/catalogos/${id}`);
    }

	getCatalogos(): Observable<CatalogoBackoffice[]> {
		return this.http.get<CatalogoBackoffice[]>(`${this.API_URL}/admin/catalogos`);
	}

	updateCatalogo(id: number, datosActualizados: Partial<Catalogo>): Observable<Catalogo> {
        return this.http.patch<Catalogo>(`${this.API_URL}/seller/catalogos/${id}`, datosActualizados);
    }

	uploadLogoTienda(file: File, nombreCatalogo: string): Observable<{ url: string }> {
		const formData = new FormData();
		formData.append('nombreCatalogo', nombreCatalogo);
		formData.append('foto', file);
		
		return this.http.post<{ url: string }>(`${this.API_URL}/seller/catalogos/upload-imagen`, formData);
	}
}