import { z } from "zod";

export const addressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{6,19}$/, "Enter a valid phone number"),
  addressLine1: z.string().trim().min(3).max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().max(20),
  country: z.string().trim().min(2).max(80),
}).superRefine((value, context) => {
  if ((value.country === "India" || value.country === "IN") && !/^[1-9][0-9]{5}$/.test(value.postalCode)) {
    context.addIssue({ code: "custom", path: ["postalCode"], message: "Enter a valid 6-digit Indian PIN code" });
  } else if (value.postalCode.length < 3) {
    context.addIssue({ code: "too_small", path: ["postalCode"], minimum: 3, inclusive: true, origin: "string", message: "Postal code is too short" });
  }
}).strict();

export const addressWriteSchema = addressSchema.extend({ isDefault: z.boolean().optional().default(false) });
export type AddressInput = z.infer<typeof addressWriteSchema>;

export const checkoutSchema = z.object({
  addressId: z.string().cuid().optional(),
  address: addressSchema.optional(),
}).refine((value) => Boolean(value.addressId || value.address), { message: "Choose or add a shipping address" });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
