import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/authorization";
import { getOrderForUser } from "@/lib/orders/service";

export const metadata: Metadata = { title: "Order confirmation" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/orders/${id}`);
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();
  return <main className="order-page container"><div className="page-intro"><p className="eyebrow">Order confirmed</p><h1>Thank you for your order.</h1><p className="sans">Order {order.orderNumber} was created on {order.createdAt.toLocaleDateString("en-IN")}.</p></div><div className="order-layout"><section className="order-card"><div className="order-heading"><div><p className="eyebrow">Order details</p><h2>{order.orderNumber}</h2></div><span className="order-status sans">{order.status.replaceAll("_", " ")}</span></div><div className="order-items">{order.items.map((item) => <article className="order-item" key={`${item.productId}-${item.sku}`}><Image src={item.product.images[0]?.imageUrl ?? "/patterns/cotton.svg"} alt={item.productTitle} width={72} height={90} /><div><h3>{item.productTitle}</h3><p className="sans muted">SKU: {item.sku} · Quantity: {item.quantity}</p><p className="sans">₹{Number(item.unitSellingPrice).toLocaleString("en-IN")} each</p></div><strong className="sans">₹{Number(item.totalPrice).toLocaleString("en-IN")}</strong></article>)}</div></section><aside className="summary"><p className="eyebrow">Shipping address</p><p className="sans order-address"><strong>{order.shippingName}</strong><br />{order.shippingAddressLine1}{order.shippingAddressLine2 ? <><br />{order.shippingAddressLine2}</> : null}<br />{order.shippingCity}, {order.shippingState} {order.shippingPostalCode}<br />{order.shippingCountry}<br />{order.shippingPhone}</p><div className="summary-row sans"><span>Total</span><strong>₹{Number(order.totalAmount).toLocaleString("en-IN")}</strong></div><p className="muted sans">Payment status: pending. Payment processing will be added separately.</p></aside></div></main>;
}
