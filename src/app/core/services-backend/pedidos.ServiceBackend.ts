import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs';
import { CrearPedidoRequest, CrearPedidoResponse, PedidoDTO } from '../models/pedido.model';

@Injectable({
    providedIn: 'root'
})
export class PedidosServiceBackend {
    private http = inject(HttpClient);
    private API_URL = environment.apiUrl;

    registrarPedido(pedidoData: CrearPedidoRequest): Observable<CrearPedidoResponse> {
        return this.http.post<CrearPedidoResponse>(`${this.API_URL}/public/pedidos/registrar-pedido`, pedidoData);
    }

    obtenerPedidosActivos(): Observable<PedidoDTO[]> {
        return this.http.get<PedidoDTO[]>(`${this.API_URL}/seller/pedidos/pedidos-activos`);
    }

}