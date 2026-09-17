import { z } from "zod";

export const productIdSchema = z.object({ productId: z.string().min(1).max(64) });
export const cartAddSchema = productIdSchema.extend({ quantity: z.number().int().min(1).max(99) });
export const cartQuantitySchema = productIdSchema.extend({ quantity: z.number().int().min(1).max(99) });