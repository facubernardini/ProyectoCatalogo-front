export interface PlantillaDimensionDTO {
    id: number;
    catalogo_id: number;
    
    nombre: string;
    peso_gr: number;
    alto_cm: number;
    ancho_cm: number;
    largo_cm: number;
}

export interface PlantillaDimensionSoftDTO {
    peso_gr: number;
    alto_cm: number;
    ancho_cm: number;
    largo_cm: number;
}