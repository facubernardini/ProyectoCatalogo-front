import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CuponVerificado } from '../models/cupon.model';

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
}