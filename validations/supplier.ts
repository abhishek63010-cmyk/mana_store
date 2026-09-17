import { z } from "zod";

export const supplierProductSchema = z.object({
  supplierSku: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  category: z.string().min(1),
  fabric: z.string().nullable(),
  weave: z.string().nullable(),
  supplierPrice: z.number().nonnegative(),
  currency: z.string().length(3),
  stock: z.number().int().nonnegative(),
  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "UNAVAILABLE"]),
  images: z.array(z.string().url()),
  metadata: z.record(z.string(), z.unknown()),
});
