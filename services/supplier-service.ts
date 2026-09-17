import "server-only";
import type { SupplierAdapter } from "@/suppliers/adapter";
import { createSupplierAdapter } from "@/suppliers/registry";

export function createSupplierAdapters(): SupplierAdapter[] {
  return [createSupplierAdapter("weave365")];
}
