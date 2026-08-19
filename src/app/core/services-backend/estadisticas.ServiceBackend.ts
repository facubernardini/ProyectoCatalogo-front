import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs';
import { ResumenMensualDTO, ResumenDiarioGraficoDTO, TopProductoDTO } from '../models/estadisticas.model';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasServiceBackend {
    private http = inject(HttpClient);
    private API_URL = environment.apiUrl;

    getResumenMensual(mes?: number, anio?: number): Observable<ResumenMensualDTO> {
        let params = new HttpParams();
        if (mes) params = params.set('mes', mes);
        if (anio) params = params.set('anio', anio);

        return this.http.get<ResumenMensualDTO>(`${this.API_URL}/seller/estadisticas/resumen`, { params });
    }

    getEvolucionDiaria(mes?: number, anio?: number): Observable<ResumenDiarioGraficoDTO[]> {
        let params = new HttpParams();
        if (mes) params = params.set('mes', mes);
        if (anio) params = params.set('anio', anio);

        return this.http.get<ResumenDiarioGraficoDTO[]>(`${this.API_URL}/seller/estadisticas/evolucion`, { params });
    }

    getTopProductos(mes?: number, anio?: number, limit: number = 5): Observable<TopProductoDTO[]> {
        let params = new HttpParams();
        if (mes) params = params.set('mes', mes);
        if (anio) params = params.set('anio', anio);
        params = params.set('limit', limit);

        return this.http.get<TopProductoDTO[]>(`${this.API_URL}/seller/estadisticas/top-productos`, { params });
    }

}