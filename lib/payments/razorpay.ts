import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import { getServerEnv } from "@/lib/env";

const PROVIDER = "RAZORPAY";

function getRazorpay() {
  const env = getServerEnv();
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) throw new PaymentError("CONFIGURATION", "Razorpay is not configured.");
  return { client: new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET }), keyId: env.RAZORPAY_KEY_ID };
}

function amountInPaise(amount: Prisma.Decimal) {
  const paise = amount.mul(100).toNumber();
  if (!Number.isSafeInteger(paise) || paise <= 0) throw new Error("Invalid payment amount.");
  return paise;
}

export class PaymentError extends Error {
  constructor(public readonly code: "NOT_FOUND" | "NOT_ELIGIBLE" | "CONFIGURATION" | "INVALID_PAYMENT", message: string) {
    super(message);
  }
}

export async function createPaymentOrder(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: userId },
    select: { id: true, orderNumber: true, totalAmount: true, currency: true, status: true, payments: { where: { provider: PROVIDER }, take: 1 } },
  });
  if (!order) throw new PaymentError("NOT_FOUND", "Order not found.");
  if (order.status !== "PENDING_PAYMENT") throw new PaymentError("NOT_ELIGIBLE", "This order is not awaiting payment.");

  const existing = order.payments[0];
  if (existing?.status === PaymentStatus.CAPTURED) throw new PaymentError("NOT_ELIGIBLE", "This order has already been paid.");
  const razorpay = getRazorpay();
  const amount = amountInPaise(order.totalAmount);
  let payment = existing;

  if (!payment?.providerOrderId || payment.status === PaymentStatus.FAILED) {
    const providerOrder = await razorpay.client.orders.create({ amount, currency: order.currency, receipt: order.orderNumber, notes: { internalOrderId: order.id } });
    payment = payment
      ? await prisma.payment.update({ where: { id: payment.id }, data: { providerOrderId: providerOrder.id, providerPaymentId: null, amount: order.totalAmount, currency: order.currency, status: PaymentStatus.CREATED } })
      : await prisma.payment.create({ data: { orderId: order.id, provider: PROVIDER, providerOrderId: providerOrder.id, amount: order.totalAmount, currency: order.currency, status: PaymentStatus.CREATED } });
  }

  return { keyId: razorpay.keyId, orderId: payment.providerOrderId!, amount, currency: order.currency, internalOrderId: order.id, internalOrderNumber: order.orderNumber };
}

function validSignature(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(actual, "utf8");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const env = getServerEnv();
  if (!env.RAZORPAY_KEY_SECRET) throw new PaymentError("CONFIGURATION", "Razorpay is not configured.");
  const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return validSignature(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const env = getServerEnv();
  if (!env.RAZORPAY_WEBHOOK_SECRET) throw new PaymentError("CONFIGURATION", "Razorpay webhook is not configured.");
  const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return validSignature(expected, signature);
}

export async function verifyAndCapturePayment(userId: string, internalOrderId: string, paymentId: string, razorpayOrderId: string, signature: string) {
  const valid = verifyCheckoutSignature(razorpayOrderId, paymentId, signature);
  if (!valid) throw new PaymentError("INVALID_PAYMENT", "Payment verification failed.");
  const payment = await prisma.payment.findFirst({ where: { orderId: internalOrderId, provider: PROVIDER, providerOrderId: razorpayOrderId }, include: { order: true } });
  if (!payment || payment.order.customerId !== userId) throw new PaymentError("NOT_FOUND", "Payment not found.");
  if (payment.status === PaymentStatus.CAPTURED) return payment;

  const razorpay = getRazorpay();
  const providerPayment = await razorpay.client.payments.fetch(paymentId);
  if (providerPayment.order_id !== razorpayOrderId || Number(providerPayment.amount) !== amountInPaise(payment.amount) || providerPayment.currency !== payment.currency || providerPayment.status !== "captured") {
    throw new PaymentError("INVALID_PAYMENT", "Payment has not been captured.");
  }
  return capturePayment(payment.id, payment.orderId, paymentId);
}

export async function capturePayment(paymentId: string, orderId: string, providerPaymentId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status === PaymentStatus.CAPTURED) return payment;
    const updated = await tx.payment.update({ where: { id: payment.id }, data: { providerPaymentId, status: PaymentStatus.CAPTURED } });
    await tx.order.updateMany({ where: { id: orderId, status: "PENDING_PAYMENT" }, data: { status: "PAID" } });
    return updated;
  });
}

export async function failPayment(providerOrderId: string, providerPaymentId?: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({ where: { provider: PROVIDER, providerOrderId } });
    if (!payment || payment.status === PaymentStatus.CAPTURED) return payment;
    return tx.payment.update({ where: { id: payment.id }, data: { providerPaymentId: providerPaymentId ?? payment.providerPaymentId, status: PaymentStatus.FAILED } });
  });
}

export async function authorizePayment(providerOrderId: string, providerPaymentId: string) {
  return prisma.payment.updateMany({ where: { provider: PROVIDER, providerOrderId, status: { not: PaymentStatus.CAPTURED } }, data: { providerPaymentId, status: PaymentStatus.AUTHORIZED } });
}