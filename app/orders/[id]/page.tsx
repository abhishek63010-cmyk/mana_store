import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/authorization";
import { getOrderForUser } from "@/lib/orders/service";

export const metadata: Metadata = { title: "Order details" };

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Payment pending", PAID: "Paid", STOCK_CHECKING: "Checking stock", SUPPLIER_ORDER_PENDING: "Preparing order",
  SUPPLIER_ORDER_CREATED: "Preparing order", PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled",
  REFUND_PENDING: "Refund pending", REFUNDED: "Refunded", FAILED: "Failed",
};
const formatStatus = (status: string) => statusLabels[status] ?? status.replaceAll("_", " ").toLowerCase();
const formatMoney = (amount: number, currency: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/orders/${id}`);
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();
  return <main className="order-page container"><div className="page-intro"><p className="eyebrow">Order details</p><h1>{order.orderNumber}</h1><p className="sans">Placed on {order.createdAt.toLocaleDateString("en-IN", { dateStyle: "long" })} · <strong>{formatStatus(order.status)}</strong></p></div><div className="order-layout"><section className="order-card"><div className="order-heading"><div><p className="eyebrow">Items in this order</p><h2>{order.itemCount} item(s)</h2></div><span className="order-status sans">{formatStatus(order.status)}</span></div><div className="order-items">{order.items.map((item) => <article className="order-item" key={item.id}><div className="order-item-placeholder" aria-hidden="true">AF</div><div><h3>{item.productTitle}</h3><p className="sans muted">SKU: {item.sku} · Quantity: {item.quantity}</p><p className="sans">{formatMoney(item.unitPrice, order.currency)} each</p></div><strong className="sans">{formatMoney(item.subtotal, order.currency)}</strong></article>)}</div></section><aside className="order-aside"><section className="summary"><p className="eyebrow">Shipping address</p><p className="sans order-address"><strong>{order.shippingAddress.name}</strong><br />{order.shippingAddress.line1}{order.shippingAddress.line2 ? <><br />{order.shippingAddress.line2}</> : null}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />{order.shippingAddress.country}<br />{order.shippingAddress.phone}</p></section><section className="summary"><p className="eyebrow">Payment</p><p className="sans">{order.paymentStatus ? formatStatus(order.paymentStatus) : "No payment recorded"}</p></section><section className="summary"><p className="eyebrow">Shipment</p>{order.shipments.length === 0 ? <p className="muted sans">Not shipped yet.</p> : order.shipments.map((shipment, index) => <div className="shipment" key={`${shipment.trackingNumber ?? "shipment"}-${index}`}><p className="sans"><strong>{formatStatus(shipment.status)}</strong>{shipment.carrier ? ` · ${shipment.carrier}` : ""}</p>{shipment.trackingNumber && <p className="muted sans">Tracking: {shipment.trackingUrl ? <a href={shipment.trackingUrl}>{shipment.trackingNumber}</a> : shipment.trackingNumber}</p>}{shipment.estimatedDelivery && <p className="muted sans">Estimated delivery: {shipment.estimatedDelivery.toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>}</div>)}</section><section className="summary"><div className="summary-row sans"><span>Order total</span><strong>{formatMoney(order.total, order.currency)}</strong></div></section></aside></div></main>;
}
