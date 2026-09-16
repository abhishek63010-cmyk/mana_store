import { z } from "zod";

export const supplierProductSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  currency: z.string().length(3),
  available: z.boolean(),
});
