import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/authorization";
import { getCheckoutSnapshot } from "@/lib/orders/service";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const snapshot = await getCheckoutSnapshot(user.id);
  return <main className="checkout-page container"><div className="page-intro"><p className="eyebrow">Almost there</p><h1>Checkout</h1><p className="sans">Review your address and order details before placing your order.</p></div><CheckoutForm addresses={snapshot.addresses} items={snapshot.items} /></main>;
}
