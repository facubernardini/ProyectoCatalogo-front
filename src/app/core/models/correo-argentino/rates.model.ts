import { DeliveredType, ProductType } from "src/app/shared/enums/correo-argentino.enum";

// SHARED
export interface DimensionsDTO {
  weight: number;
  height: number;
  width: number;
  length: number;
}

// REQUESTS
export interface ProductDimensionsDTO extends DimensionsDTO {
  quantity?: number;
}

export interface PublicShippingRequestDTO {
  postalCodeDestination: string;
  deliveredType?: DeliveredType;
  dimensions: ProductDimensionsDTO[];
}

// RESPONSES
export interface RateDTO {
  deliveredType: DeliveredType;
  productType: ProductType;
  productName: string;
  price: number;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
}

export interface ResponseRatesDTO {
  validTo: string;
  dimensions: DimensionsDTO;
  rates: RateDTO[];
}