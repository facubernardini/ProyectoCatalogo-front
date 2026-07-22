import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev';
import { ProductoImportado } from '../models/carga-masiva.model';

export interface BulkImportResponse {
    message: string;
    estadisticas: {
        productos_procesados_total: number;
        productos_creados_exito: number;
        nuevas_categorias_creadas: number;
        fotos_subidas: number;
        fotos_fallidas: number;
    };
}

@Injectable({ providedIn: 'root' })
export class BulkImportService {
	private http = inject(HttpClient);
	private API_URL = environment.apiUrl;

	bulkImportProductos(catalogoId: string | number, productos: ProductoImportado[]): Observable<BulkImportResponse> {
        
        const payload = {
            catalogoId: catalogoId,
            productos: productos
        };

        return this.http.post<BulkImportResponse>(`${this.API_URL}/seller/bulk-import`, payload);
    }
}