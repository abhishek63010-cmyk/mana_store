import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/orders/service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await params;
  const order = await getOrderForUser(id, user.id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}