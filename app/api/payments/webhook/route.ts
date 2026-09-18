import { NextResponse } from "next/server";
import { authorizePayment, capturePayment, failPayment, PaymentError, verifyWebhookSignature } from "@/lib/payments/razorpay";
import { prisma } from "@/database/client";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  try {
    if (!signature || !verifyWebhookSignature(rawBody, signature)) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
  const payment = event.payload?.payment?.entity;
  if (payment?.order_id && payment.id && event.event === "payment.authorized") {
    await authorizePayment(payment.order_id, payment.id);
  } else if (payment?.order_id && payment.id && event.event === "payment.captured") {
    const record = await prisma.payment.findFirst({ where: { provider: "RAZORPAY", providerOrderId: payment.order_id } });
    if (record) await capturePayment(record.id, record.orderId, payment.id);
  } else if (payment?.order_id && event.event === "payment.failed") {
    await failPayment(payment.order_id, payment.id);
  }
  return NextResponse.json({ received: true });
}