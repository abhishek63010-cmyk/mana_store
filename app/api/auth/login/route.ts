import { NextResponse } from "next/server";
import { prisma } from "@/database/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/validations/auth";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user?.passwordHash ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
}