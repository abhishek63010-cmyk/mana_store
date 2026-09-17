import type {
  SupplierCode,
  SupplierOrderRequest,
  SupplierOrderResponse,
  SupplierOrderStatus,
  SupplierProductData,
  SupplierStockData,
} from "@/types/supplier";

export interface SupplierAdapter {
  readonly code: SupplierCode;
  getProduct(supplierSku: string): Promise<SupplierProductData | null>;
  syncProducts(): Promise<readonly SupplierProductData[]>;
  syncStock(): Promise<readonly SupplierStockData[]>;
  checkStock(supplierSku: string): Promise<SupplierStockData>;
  createOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse>;
  getOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus>;
  cancelOrder(supplierOrderId: string): Promise<SupplierOrderStatus>;
}
