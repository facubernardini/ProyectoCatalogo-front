import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map } from 'rxjs';
import { CorreoArgentinoServiceBackend } from '../services-backend/correo-argentino.ServiceBackend';
import { PublicShippingRequestDTO, RateDTO, ResponseRatesDTO } from '../models/correo-argentino/rates.model';
import { Producto } from '../models/producto.model';
import { CartItem } from '../models/cartItem.model';
import { ResponseAgencyDTO, PublicAgenciesRequestDTO } from '../models/correo-argentino/agencies.model';
import { AgencyServiceType } from 'src/app/shared/enums/correo-argentino.enum';

@Injectable({
  providedIn: 'root'
})
export class CorreoArgentinoService {
  private correoArgentinoServiceBackend = inject(CorreoArgentinoServiceBackend);

  cotizarEnvio(
    slugTienda: string,
    cpDestino: string,
    cantidad: number,
    producto: Producto,
    presentacionActiva?: any
  ): Observable<RateDTO[]> {
    
    const dimensiones = presentacionActiva?.plantilla || producto.plantilla;

    if (!dimensiones) {
      return throwError(() => new Error('Este producto no tiene dimensiones configuradas.'));
    }

    const payload: PublicShippingRequestDTO = {
      postalCodeDestination: String(cpDestino).trim(),
      dimensions: [
        {
          weight: Number(dimensiones.peso_gr),
          height: Number(dimensiones.alto_cm),
          width: Number(dimensiones.ancho_cm),
          length: Number(dimensiones.largo_cm),
          quantity: Number(cantidad)
        }
      ]
    };

    return this.correoArgentinoServiceBackend.cotizarEnvio(slugTienda, payload).pipe(
      map((res: ResponseRatesDTO) => this.mapearOpciones(res.rates || []))
    );
  }

  cotizarCarrito(
    slugTienda: string,
    cpDestino: string,
    itemsCarrito: CartItem[],
    productosTotales: Producto[]
  ): Observable<ResponseRatesDTO> {
    const dimensionesArray = itemsCarrito
      .map(item => {
        const producto = productosTotales.find(p => p.id === item.productoId);
        const presentacion = producto?.presentaciones?.find((p: any) => p.id === item.presentacionId);
        const dimensiones = presentacion?.plantilla || producto?.plantilla;

        if (!dimensiones) return null;

        return {
          weight: Number(dimensiones.peso_gr),
          height: Number(dimensiones.alto_cm),
          width: Number(dimensiones.ancho_cm),
          length: Number(dimensiones.largo_cm),
          quantity: Number(item.cantidad)
        };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);

    if (dimensionesArray.length === 0) {
      return throwError(() => new Error('No hay productos válidos con dimensiones para cotizar.'));
    }

    const payload: PublicShippingRequestDTO = {
      postalCodeDestination: String(cpDestino).trim(),
      dimensions: dimensionesArray
    };

    return this.correoArgentinoServiceBackend.cotizarEnvio(slugTienda, payload).pipe(
      map((res: ResponseRatesDTO) => ({
        ...res,
        rates: this.mapearOpciones(res.rates || [])
      }))
    );
  }

  private mapearOpciones(rates: any[]): RateDTO[] {
    return rates.map(rate => ({
			deliveredType: rate.deliveredType,
			productType: rate.productType,
			productName: rate.productName || '',
			price: Number(rate.price ?? 0),
			deliveryTimeMin: String(rate.deliveryTimeMin ?? ''),
			deliveryTimeMax: String(rate.deliveryTimeMax ?? '')
    })).sort((a, b) => a.price - b.price);
	}

  obtenerSucursales(
    slugTienda: string,
    provinceCode: string,
    services: AgencyServiceType = AgencyServiceType.PICKUP_AVAILABILITY
  ): Observable<ResponseAgencyDTO[]> {
    const codigoProvincia = String(provinceCode).trim().toUpperCase();

    if (!codigoProvincia || codigoProvincia.length !== 1) {
      return throwError(() => new Error('Seleccioná una provincia válida.'));
    }

    const payload: PublicAgenciesRequestDTO = {
      provinceCode: codigoProvincia,
      services
    };

    return this.correoArgentinoServiceBackend.obtenerSucursales(slugTienda, payload);
  }
}