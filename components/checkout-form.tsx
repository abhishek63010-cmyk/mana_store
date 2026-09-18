"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/button";
import { PriceDisplay } from "@/components/price-display";
import type { CheckoutInput } from "@/validations/checkout";

type Address = Omit<NonNullable<CheckoutInput["address"]>, "addressLine2"> & { id: string; addressLine2: string | null; isDefault?: boolean };
type Item = { productId: string; title: string; price: number; quantity: number; image: string; available: boolean };

export function CheckoutForm({ addresses, items }: { addresses: readonly Address[]; items: readonly Item[] }) {
  const router = useRouter();
  const { refresh } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "new");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const canSubmit = items.length > 0 && items.every((item) => item.available) && selectedAddress !== "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const input: CheckoutInput = selectedAddress === "new" ? { address: {
      name: String(form.get("name") ?? ""), phone: String(form.get("phone") ?? ""), addressLine1: String(form.get("addressLine1") ?? ""), addressLine2: String(form.get("addressLine2") ?? ""), city: String(form.get("city") ?? ""), state: String(form.get("state") ?? ""), postalCode: String(form.get("postalCode") ?? ""), country: String(form.get("country") ?? ""),
    } } : { addressId: selectedAddress };
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "We could not place your order."); setLoading(false); return; }
    await fetch("/api/payments/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: result.order.id }) });
    await refresh();
    router.push(`/orders/${result.order.id}`);
    router.refresh();
  }

  return <form className="checkout-layout" onSubmit={submit} noValidate>
    <div className="checkout-main">
      <section className="checkout-section"><div className="section-heading"><div><p className="eyebrow">Step 1</p><h2>Shipping address</h2></div></div>
        {addresses.length > 0 && <div className="address-list">{addresses.map((address) => <label className={`address-option ${selectedAddress === address.id ? "selected" : ""}`} key={address.id}><input type="radio" name="savedAddress" value={address.id} checked={selectedAddress === address.id} onChange={() => setSelectedAddress(address.id)} /><span><strong>{address.name}</strong><small>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}, {address.city}, {address.state} {address.postalCode}, {address.country}<br />{address.phone}</small></span></label>)}</div>}
        <label className={`address-option ${selectedAddress === "new" ? "selected" : ""}`}><input type="radio" name="savedAddress" value="new" checked={selectedAddress === "new"} onChange={() => setSelectedAddress("new")} /><span><strong>{addresses.length ? "Use a new address" : "Add a shipping address"}</strong></span></label>
        {selectedAddress === "new" && <div className="address-fields"><label>Name<input name="name" autoComplete="name" required /></label><label>Phone<input name="phone" autoComplete="tel" required /></label><label>Address line 1<input name="addressLine1" autoComplete="address-line1" required /></label><label>Address line 2 <span className="muted">(optional)</span><input name="addressLine2" autoComplete="address-line2" /></label><label>City<input name="city" autoComplete="address-level2" required /></label><label>State<input name="state" autoComplete="address-level1" required /></label><label>Postal code<input name="postalCode" autoComplete="postal-code" required /></label><label>Country<input name="country" autoComplete="country-name" defaultValue="India" required /></label><p className="muted sans"><Link href="/account/addresses">Manage saved addresses</Link></p></div>}
      </section>
      <section className="checkout-section"><p className="eyebrow">Step 2</p><h2>Review order</h2><div className="checkout-items">{items.map((item) => <article className="checkout-item" key={item.productId}><Image src={item.image} alt={item.title} width={80} height={100} /><div><h3>{item.title}</h3><p className="sans muted">Quantity: {item.quantity}</p>{item.available ? <p className="sans">Item subtotal: ₹{(item.price * item.quantity).toLocaleString("en-IN")}</p> : <p className="form-error">This product is unavailable.</p>}</div><PriceDisplay price={item.price} /></article>)}</div></section>
    </div>
    <aside className="summary checkout-summary"><p className="eyebrow">Order total</p><div className="summary-row sans"><span>Total quantity</span><strong>{totalQuantity}</strong></div><div className="summary-row sans"><span>Cart subtotal</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div><div className="summary-row sans"><span>Final total</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div>{error && <p className="form-error" role="alert">{error}</p>}{!items.length ? <p className="muted sans">Your cart is empty.</p> : null}<Button type="submit" disabled={!canSubmit || loading}>{loading ? "Placing order..." : "Place order"}</Button></aside>
  </form>;
}
