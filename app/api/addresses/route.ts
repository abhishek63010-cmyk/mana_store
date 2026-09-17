import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAddress, listAddresses } from "@/lib/addresses/service";
import { addressWriteSchema } from "@/validations/checkout";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try { return NextResponse.json({ addresses: await listAddresses(user.id) }); }
  catch (error) { console.error("Address list failed", error); return NextResponse.json({ error: "We could not load your addresses." }, { status: 500 }); }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = addressWriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid address." }, { status: 400 });
  try { return NextResponse.json({ address: await createAddress(user.id, parsed.data) }, { status: 201 }); }
  catch (error) { console.error("Address create failed", error); return NextResponse.json({ error: "We could not save your address." }, { status: 500 }); }
}