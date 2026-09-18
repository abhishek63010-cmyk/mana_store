import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { PaymentError, verifyAndCapturePayment } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json().catch(() => null) as { internalOrderId?: unknown; razorpayOrderId?: unknown; razorpayPaymentId?: unknown; razorpaySignature?: unknown } | null;
  if (!body || ![body.internalOrderId, body.razorpayOrderId, body.razorpayPaymentId, body.razorpaySignature].every((value) => typeof value === "string" && value)) return NextResponse.json({ error: "Payment verification details are required." }, { status: 400 });
  try {
    const payment = await verifyAndCapturePayment(user.id, body.internalOrderId as string, body.razorpayPaymentId as string, body.razorpayOrderId as string, body.razorpaySignature as string);
    return NextResponse.json({ ok: true, orderId: payment?.orderId });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.code === "NOT_FOUND" ? 404 : error.code === "INVALID_PAYMENT" ? 400 : 503 });
    console.error("Payment verification failed", error);
    return NextResponse.json({ error: "We could not verify this payment." }, { status: 500 });
  }
}