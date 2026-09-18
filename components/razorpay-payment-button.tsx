"use client";

import Script from "next/script";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = { key: string; amount: number; currency: string; name: string; order_id: string; handler: (response: RazorpayResponse) => void; modal: { ondismiss: () => void } };
type RazorpayInstance = { open: () => void; on: (event: "payment.failed", handler: () => void) => void };

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function RazorpayPaymentButton({ orderId, label = "Pay now" }: { orderId: string; label?: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    if (loading) return;
    setLoading(true);
    setError("");
    const response = await fetch("/api/payments/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "We could not start payment."); setLoading(false); return; }
    if (!ready || !window.Razorpay) { setError("Payment checkout is still loading. Please try again."); setLoading(false); return; }
    const checkout = new window.Razorpay({
      key: result.keyId, amount: result.amount, currency: result.currency, name: "Mana Store", order_id: result.orderId,
      handler: async (payment: RazorpayResponse) => {
        const verification = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ internalOrderId: result.internalOrderId, razorpayOrderId: payment.razorpay_order_id, razorpayPaymentId: payment.razorpay_payment_id, razorpaySignature: payment.razorpay_signature }) });
        const verificationResult = await verification.json().catch(() => null);
        if (!verification.ok) { setError(verificationResult?.error ?? "We could not verify this payment."); setLoading(false); return; }
        router.refresh();
        setLoading(false);
      },
      modal: { ondismiss: () => setLoading(false) },
    });
    checkout.on("payment.failed", () => { setError("Payment failed. Your order is still available to retry."); setLoading(false); });
    checkout.open();
  }

  return <div className="payment-action"><Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setReady(true)} /><Button type="button" onClick={pay} disabled={loading}>{loading ? "Opening payment..." : label}</Button>{error ? <p className="form-error" role="alert">{error}</p> : null}</div>;
}