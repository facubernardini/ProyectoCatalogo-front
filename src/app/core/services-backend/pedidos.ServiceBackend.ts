import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs';
import { CrearPedidoRequest, CrearPedidoResponse, EstadoPago, EstadoPedido, PaginatedResponse, PedidoDTO } from '../models/pedido.model';

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

    getHistorialPedidos(
        catalogoId: number, 
        page: number = 1, 
        limit: number = 15, 
        search: string = ''
    ): Observable<PaginatedResponse<PedidoDTO>> {
        
        let params = new HttpParams()
            .set('catalogo_id', catalogoId)
            .set('page', page)
            .set('limit', limit);

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<PaginatedResponse<PedidoDTO>>(`${this.API_URL}/seller/pedidos/historial`, { params });
    }

    editarPedido(id: string, datos: Partial<PedidoDTO>) {
        return this.http.put<PedidoDTO>(`${this.API_URL}/seller/pedidos/${id}`, datos);
    }

    cambiarEstadoPedido(id: string, nuevoEstado: EstadoPedido) {
        return this.http.patch<PedidoDTO>(`${this.API_URL}/seller/pedidos/${id}/estado`, { estado: nuevoEstado });
    }

    cambiarEstadoPago(id: string, nuevoEstadoPago: EstadoPago): Observable<any> {
        return this.http.patch(`${this.API_URL}/seller/pedidos/${id}/estado-pago`, { estado_pago: nuevoEstadoPago });
    }

}