import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Cupon, CuponVerificado } from '../models/cupon.model';

@Injectable({
  providedIn: 'root'
})
export class CuponServiceBackend {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    // Verificar si un cupon es valido (activo y con usos disponibles) para un catalogo especifico
    verificarCupon(codigo: string, catalogo_id: number) {
        return this.http.post<CuponVerificado>(`${this.apiUrl}/public/cupones/verificar`, {
            codigo: codigo.toUpperCase().trim(),
            catalogo_id
        });
    }

    getCuponesByCatalogo(catalogo_id: number) {
        return this.http.get<Cupon[]>(`${this.apiUrl}/seller/cupones/${catalogo_id}`);
    }

    createCupon(payload: Partial<Cupon>) {
        return this.http.post<Cupon>(`${this.apiUrl}/seller/cupones`, payload);
    }

    updateCupon(id: number, payload: Partial<Cupon>) {
        return this.http.put<Cupon>(`${this.apiUrl}/seller/cupones/${id}`, payload);
    }

    deleteCupon(id: number) {
        return this.http.delete<void>(`${this.apiUrl}/seller/cupones/${id}`);
    }
}