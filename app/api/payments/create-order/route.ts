import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { PaymentError, createPaymentOrder } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json().catch(() => null) as { orderId?: unknown } | null;
  if (!body || typeof body.orderId !== "string" || !body.orderId) return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
  try {
    return NextResponse.json(await createPaymentOrder(body.orderId, user.id));
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.code === "NOT_FOUND" ? 404 : error.code === "NOT_ELIGIBLE" ? 409 : 503 });
    console.error("Payment order creation failed", error);
    return NextResponse.json({ error: "We could not start payment. Please try again." }, { status: 500 });
  }
}