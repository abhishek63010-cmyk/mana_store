import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/database/client";
import { getServerEnv } from "@/lib/env";

export const SESSION_COOKIE = "mana_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function sign(value: string) {
  return createHmac("sha256", getServerEnv().AUTH_SESSION_SECRET).update(value).digest("base64url");
}

function createToken(userId: string) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function readUserId(token: string | undefined) {
  if (!token) return null;
  const lastSeparator = token.lastIndexOf(".");
  const payload = token.slice(0, lastSeparator);
  const signature = token.slice(lastSeparator + 1);
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const validSignature = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!validSignature) return null;
  const separator = payload.lastIndexOf(".");
  const userId = payload.slice(0, separator);
  const issuedAt = Number(payload.slice(separator + 1));
  if (!userId || !Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_MAX_AGE * 1000) return null;
  return userId;
}

export const safeUserSelect = { id: true, name: true, email: true, phone: true, role: true } as const;
export type SafeUser = { id: string; name: string; email: string; phone: string | null; role: "CUSTOMER" | "ADMIN" };

export async function getCurrentUser(): Promise<SafeUser | null> {
  const userId = readUserId((await cookies()).get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId }, select: safeUserSelect });
}

export async function createSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, createToken(userId), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE });
}

export async function clearSession() {
  (await cookies()).set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}