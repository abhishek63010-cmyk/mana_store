export type SupplierCode = "weave365";

export type SupplierAvailability = "IN_STOCK" | "OUT_OF_STOCK" | "UNAVAILABLE";

export type SupplierOrderState =
  | "PENDING"
  | "CREATED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export interface SupplierTrackingInfo {
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
}

export interface SupplierProductData {
  supplierSku: string;
  title: string;
  description: string | null;
  category: string;
  fabric: string | null;
  weave: string | null;
  supplierPrice: number;
  currency: string;
  stock: number;
  availability: SupplierAvailability;
  images: readonly string[];
  metadata: Readonly<Record<string, unknown>>;
}

export interface SupplierStockData {
  supplierSku: string;
  stock: number;
  availability: SupplierAvailability;
}

export interface SupplierOrderItem {
  supplierSku: string;
  quantity: number;
}

export interface SupplierShippingInformation {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SupplierOrderRequest {
  resellerOrderId: string;
  items: readonly SupplierOrderItem[];
  customer: SupplierShippingInformation;
  packingPreference: string | null;
}

export interface SupplierOrderResponse {
  supplierOrderId: string;
  resellerOrderId: string;
  status: SupplierOrderState;
  tracking: SupplierTrackingInfo | null;
  estimatedDispatch: Date | null;
}

export interface SupplierOrderStatus {
  status: SupplierOrderState;
  tracking: SupplierTrackingInfo | null;
  estimatedDispatch: Date | null;
}
