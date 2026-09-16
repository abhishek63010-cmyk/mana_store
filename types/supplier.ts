export type SupplierCode = "weave365";

export interface SupplierProduct {
  externalId: string;
  name: string;
  price: number;
  currency: string;
  available: boolean;
}
