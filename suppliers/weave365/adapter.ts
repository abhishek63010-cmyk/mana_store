import type { SupplierAdapter } from "@/suppliers/adapter";
import type { SupplierProduct } from "@/types/supplier";

export class Weave365Adapter implements SupplierAdapter {
  readonly code = "weave365" as const;

  constructor(private readonly apiUrl: string, private readonly apiKey: string) {}

  async listProducts(): Promise<SupplierProduct[]> {
    throw new Error("Weave365 product synchronization is not implemented yet.");
  }

  async getProduct(_externalId: string): Promise<SupplierProduct | null> {
    throw new Error("Weave365 product lookup is not implemented yet.");
  }

  protected get requestHeaders(): HeadersInit {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  protected get endpoint(): string {
    return this.apiUrl;
  }
}
