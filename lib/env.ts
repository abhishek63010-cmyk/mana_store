import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  WEAVE365_API_URL: z.string().url(),
  WEAVE365_API_KEY: z.string().min(1),
});

export function getServerEnv() {
  return serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    WEAVE365_API_URL: process.env.WEAVE365_API_URL,
    WEAVE365_API_KEY: process.env.WEAVE365_API_KEY,
  });
}
