import { z } from "zod";

export const addressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  addressLine1: z.string().trim().min(3).max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(80),
});

export const checkoutSchema = z.object({
  addressId: z.string().cuid().optional(),
  address: addressSchema.optional(),
}).refine((value) => Boolean(value.addressId || value.address), { message: "Choose or add a shipping address" });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
