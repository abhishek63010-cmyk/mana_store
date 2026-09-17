import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/validations/auth";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid registration details" }, { status: 400 });
  const { name, email, phone, password } = parsed.data;
  try {
    const user = await prisma.user.create({ data: { name, email, phone, passwordHash: await hashPassword(password) }, select: { id: true, name: true, email: true, phone: true, role: true } });
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Unable to create account with those details" }, { status: 409 });
    return NextResponse.json({ error: "Unable to create account right now" }, { status: 500 });
  }
}