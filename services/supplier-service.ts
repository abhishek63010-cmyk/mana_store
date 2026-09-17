import "server-only";
import { getServerEnv } from "@/lib/env";
import { Weave365Adapter } from "@/suppliers/weave365/adapter";
import type { SupplierAdapter } from "@/suppliers/adapter";

export function createSupplierAdapters(): SupplierAdapter[] {
  const env = getServerEnv();

  return [new Weave365Adapter(env.WEAVE365_API_URL, env.WEAVE365_API_KEY)];
}
