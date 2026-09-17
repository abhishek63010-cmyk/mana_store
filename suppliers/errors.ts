import type { SupplierCode } from "@/types/supplier";

export class SupplierError extends Error {
  constructor(
    message: string,
    public readonly supplierCode: SupplierCode,
    public readonly operation: string,
  ) {
    super(message);
    this.name = "SupplierError";
  }
}

export class SupplierConfigurationError extends SupplierError {
  constructor(supplierCode: SupplierCode, message: string) {
    super(message, supplierCode, "configuration");
    this.name = "SupplierConfigurationError";
  }
}

export class SupplierApiError extends SupplierError {
  constructor(
    message: string,
    supplierCode: SupplierCode,
    operation: string,
    public readonly statusCode?: number,
  ) {
    super(message, supplierCode, operation);
    this.name = "SupplierApiError";
  }
}

export class SupplierProductNotFoundError extends SupplierError {
  constructor(supplierCode: SupplierCode, supplierSku: string) {
    super(`Supplier product ${supplierSku} was not found.`, supplierCode, "getProduct");
    this.name = "SupplierProductNotFoundError";
  }
}

export class SupplierStockError extends SupplierError {
  constructor(supplierCode: SupplierCode, message: string) {
    super(message, supplierCode, "stock");
    this.name = "SupplierStockError";
  }
}

export class SupplierOrderError extends SupplierError {
  constructor(supplierCode: SupplierCode, operation: string, message: string) {
    super(message, supplierCode, operation);
    this.name = "SupplierOrderError";
  }
}