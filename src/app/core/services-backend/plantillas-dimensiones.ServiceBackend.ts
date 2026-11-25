import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.dev';
import { PlantillaDimensionDTO } from '../models/plantilla-dimension.model';

@Injectable({
  providedIn: 'root'
})
export class PlantillasDimensionesServiceBackend {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getPlantillasByCatalogo(catalogo_id: number) {
        return this.http.get<PlantillaDimensionDTO[]>(`${this.apiUrl}/seller/plantillas-dimensiones/${catalogo_id}`);
    }

    createPlantilla(payload: Partial<PlantillaDimensionDTO>) {
        return this.http.post<PlantillaDimensionDTO>(`${this.apiUrl}/seller/plantillas-dimensiones`, payload);
    }

    updatePlantilla(id: number, payload: Partial<PlantillaDimensionDTO>) {
        return this.http.put<PlantillaDimensionDTO>(`${this.apiUrl}/seller/plantillas-dimensiones/${id}`, payload);
    }

    deletePlantilla(id: number) {
        return this.http.delete<void>(`${this.apiUrl}/seller/plantillas-dimensiones/${id}`);
    }
}