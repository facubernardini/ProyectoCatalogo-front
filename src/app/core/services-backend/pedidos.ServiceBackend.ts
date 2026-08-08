import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs';
import { CrearPedidoRequest, CrearPedidoResponse, PedidoDTO } from '../models/pedido.model';

export interface PaginacionMeta {
  total: number;
  pagina_actual: number;
  limite: number;
  total_paginas: number;
}

export interface RespuestaPedidosPaginados {
  data: PedidoDTO[];
  meta: PaginacionMeta;
}

// Filtros opcionales que el componente le puede mandar al servicio
export interface FiltrosPedido {
  estado?: string;
  estado_pago?: string;
  page?: number;
  limit?: number;
}

@Injectable({
    providedIn: 'root'
})
export class PedidosServiceBackend {
    private http = inject(HttpClient);
    private API_URL = environment.apiUrl;

    registrarPedido(pedidoData: CrearPedidoRequest): Observable<CrearPedidoResponse> {
        return this.http.post<CrearPedidoResponse>(`${this.API_URL}/public/pedidos/registrar-pedido`, pedidoData);
    }

    obtenerPedidos(filtros?: FiltrosPedido): Observable<RespuestaPedidosPaginados> {
        let params = new HttpParams();

        if (filtros) {
            if (filtros.estado) params = params.set('estado', filtros.estado);
            if (filtros.estado_pago) params = params.set('estado_pago', filtros.estado_pago);
            if (filtros.page) params = params.set('page', filtros.page.toString());
            if (filtros.limit) params = params.set('limit', filtros.limit.toString());
        }

        return this.http.get<RespuestaPedidosPaginados>(`${this.API_URL}/pedidos/obtener-pedidos`, { params });
    }

}