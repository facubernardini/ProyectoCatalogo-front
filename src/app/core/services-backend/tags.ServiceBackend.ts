import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Tag } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class TagService {
	private http = inject(HttpClient);
	private API_URL = environment.apiUrl;

	getTagsByCatalogo(catalogoId: number): Observable<Tag[]> {
		return this.http.get<Tag[]>(`${this.API_URL}/seller/tags/${catalogoId}`);
	}
}