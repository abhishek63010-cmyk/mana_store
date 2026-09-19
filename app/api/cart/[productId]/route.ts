import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { CartQuantityError, removeCartItem, updateCartItem } from "@/lib/cart-wishlist/service";
import { cartQuantitySchema } from "@/validations/cart-wishlist";

type Context = { params: Promise<{ productId: string }> };

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { productId } = await context.params;
  const parsed = cartQuantitySchema.safeParse({ productId, ...(await request.json().catch(() => null)) });
  if (!parsed.success) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  try {
    return NextResponse.json({ items: await updateCartItem(user.id, productId, parsed.data.quantity) });
  } catch (error) {
    if (error instanceof CartQuantityError) return NextResponse.json({ error: error.message }, { status: 409 });
    throw error;
  }
}

export async function DELETE(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { productId } = await context.params;
  return NextResponse.json({ items: await removeCartItem(user.id, productId) });
}