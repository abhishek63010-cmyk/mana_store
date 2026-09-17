import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/orders/service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json({ orders: await getOrdersForUser(user.id) });
}