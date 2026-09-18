import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SESSION_SECRET: z.string().min(32),
  WEAVE365_API_URL: z.string().url(),
  WEAVE365_API_KEY: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export function getServerEnv() {
  return serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET,
    WEAVE365_API_URL: process.env.WEAVE365_API_URL,
    WEAVE365_API_KEY: process.env.WEAVE365_API_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  });
}
