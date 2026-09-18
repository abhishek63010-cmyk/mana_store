import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const productInputSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens"),
  description: optionalText(5000),
  categoryId: z.string().cuid(),
  fabric: optionalText(120),
  weaveType: optionalText(120),
  sellingPrice: z.coerce.number().finite().nonnegative().max(999999999.99),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "OUT_OF_STOCK", "DISCONTINUED"]).default("DRAFT"),
  imageUrls: z.string().trim().max(5000).optional().or(z.literal("")),
}).strict();

export const categoryInputSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens"),
  description: optionalText(500),
  active: z.boolean().default(true),
}).strict();

export const orderStatusInputSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum(["PENDING_PAYMENT", "PAID", "STOCK_CHECKING", "SUPPLIER_ORDER_PENDING", "SUPPLIER_ORDER_CREATED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUND_PENDING", "REFUNDED", "FAILED"]),
}).strict();
