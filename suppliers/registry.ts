import "server-only";

import { getServerEnv } from "@/lib/env";
import type { SupplierAdapter } from "@/suppliers/adapter";
import { Weave365Adapter } from "@/suppliers/weave365/adapter";
import type { SupplierCode } from "@/types/supplier";

type SupplierAdapterFactory = () => SupplierAdapter;

const supplierAdapterFactories: Record<SupplierCode, SupplierAdapterFactory> = {
  weave365: () => {
    const env = getServerEnv();

    return new Weave365Adapter({
      apiUrl: env.WEAVE365_API_URL,
      apiKey: env.WEAVE365_API_KEY,
    });
  },
};

export function createSupplierAdapter(code: SupplierCode): SupplierAdapter {
  return supplierAdapterFactories[code]();
}