import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { removeWishlistItem } from "@/lib/cart-wishlist/service";

export async function DELETE(_request: Request, context: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { productId } = await context.params;
  if (!productId) return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  return NextResponse.json({ products: await removeWishlistItem(user.id, productId) });
}