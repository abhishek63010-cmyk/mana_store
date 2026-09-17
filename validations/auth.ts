import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email address").max(254).transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(30).optional().transform((phone) => phone || null),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(1, "Enter your password").max(128),
});