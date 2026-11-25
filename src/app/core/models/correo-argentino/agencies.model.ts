import { AgencyServiceType } from "src/app/shared/enums/correo-argentino.enum";

export interface PublicAgenciesRequestDTO {
  provinceCode: string;
  services?: AgencyServiceType;
}

export interface ResponseAgencyDTO {
  code: string;
  name: string;
  streetName: string;
  streetNumber: string;
  locality: string;
  city: string;
  postalCode: string;
}