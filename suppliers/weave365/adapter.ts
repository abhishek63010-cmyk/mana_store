import "server-only";

import type { SupplierAdapter } from "@/suppliers/adapter";
import { SupplierApiError } from "@/suppliers/errors";
import type {
  SupplierOrderRequest,
  SupplierOrderResponse,
  SupplierOrderStatus,
  SupplierProductData,
  SupplierStockData,
} from "@/types/supplier";

export interface Weave365Config {
  apiUrl: string;
  apiKey: string;
}

export class Weave365Adapter implements SupplierAdapter {
  readonly code = "weave365" as const;

  constructor(private readonly config: Weave365Config) {}

  async getProduct(_supplierSku: string): Promise<SupplierProductData | null> {
    return this.notImplemented("getProduct");
  }

  async syncProducts(): Promise<readonly SupplierProductData[]> {
    return this.notImplemented("syncProducts");
  }

  async syncStock(): Promise<readonly SupplierStockData[]> {
    return this.notImplemented("syncStock");
  }

  async checkStock(_supplierSku: string): Promise<SupplierStockData> {
    return this.notImplemented("checkStock");
  }

  async createOrder(_request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
    return this.notImplemented("createOrder");
  }

  async getOrderStatus(_supplierOrderId: string): Promise<SupplierOrderStatus> {
    return this.notImplemented("getOrderStatus");
  }

  async cancelOrder(_supplierOrderId: string): Promise<SupplierOrderStatus> {
    return this.notImplemented("cancelOrder");
  }

  private notImplemented(operation: string): never {
    throw new SupplierApiError(
      `Weave365 ${operation} is not implemented yet.`,
      this.code,
      operation,
      501,
    );
  }

  protected get requestHeaders(): HeadersInit {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  protected get endpoint(): string {
    return this.config.apiUrl;
  }
}
