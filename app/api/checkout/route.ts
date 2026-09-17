import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { CheckoutError, createOrder } from "@/lib/orders/service";
import { checkoutSchema } from "@/validations/checkout";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid shipping address." }, { status: 400 });
  try {
    const order = await createOrder(user.id, parsed.data);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutError) {
      const status = error.code === "ADDRESS_NOT_FOUND" ? 404 : error.code === "EMPTY_CART" ? 409 : 409;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("Checkout failed", error);
    return NextResponse.json({ error: "We could not place your order. Please try again." }, { status: 500 });
  }
}
