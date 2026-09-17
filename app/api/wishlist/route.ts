import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addWishlistItem, getWishlist } from "@/lib/cart-wishlist/service";
import { productIdSchema } from "@/validations/cart-wishlist";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json({ products: await getWishlist(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = productIdSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  const products = await addWishlistItem(user.id, parsed.data.productId);
  if (!products) return NextResponse.json({ error: "Product is unavailable" }, { status: 409 });
  return NextResponse.json({ products });
}