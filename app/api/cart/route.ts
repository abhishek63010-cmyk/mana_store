import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addCartItem, getCart } from "@/lib/cart-wishlist/service";
import { cartAddSchema } from "@/validations/cart-wishlist";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json({ items: await getCart(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = cartAddSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product or quantity" }, { status: 400 });
  const items = await addCartItem(user.id, parsed.data.productId, parsed.data.quantity);
  if (!items) return NextResponse.json({ error: "Product is unavailable" }, { status: 409 });
  return NextResponse.json({ items });
}