import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Catalogo } from '../models/catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
	private http = inject(HttpClient);
	private apiUrl = `${environment.apiUrl}/catalogos`; 

	getCatalogoBySlug(slug: string): Observable<Catalogo> {
		return this.http.get<Catalogo>(`${this.apiUrl}/slug/${slug}`);
	}
}