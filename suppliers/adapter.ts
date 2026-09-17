import type { SupplierCode, SupplierProduct } from "@/types/supplier";

export interface SupplierAdapter {
  readonly code: SupplierCode;
  listProducts(): Promise<SupplierProduct[]>;
  getProduct(externalId: string): Promise<SupplierProduct | null>;
}
