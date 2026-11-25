import { DeliveredType, ProductType } from "src/app/shared/enums/correo-argentino.enum";

// REQUESTS
export interface ProductDimensionsDTO {
  weight: number;
  height: number;
  width: number;
  length: number;
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
  rates: RateDTO[];
}