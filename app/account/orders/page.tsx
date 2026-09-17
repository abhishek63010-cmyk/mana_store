import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/authorization";
import { getOrdersForUser } from "@/lib/orders/service";
import { EmptyState } from "@/components/states";

export const metadata: Metadata = { title: "My orders" };

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Payment pending", PAID: "Paid", STOCK_CHECKING: "Checking stock", SUPPLIER_ORDER_PENDING: "Preparing order",
  SUPPLIER_ORDER_CREATED: "Preparing order", PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled",
  REFUND_PENDING: "Refund pending", REFUNDED: "Refunded", FAILED: "Failed",
};

const formatStatus = (status: string) => statusLabels[status] ?? status.replaceAll("_", " ").toLowerCase();
const formatMoney = (amount: number, currency: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await getOrdersForUser(user.id);
  return <main className="orders-page container"><div className="page-intro"><p className="eyebrow">Your purchases</p><h1>My orders</h1><p className="sans">A record of everything you have ordered from Abhi Fashions.</p></div>{orders.length === 0 ? <EmptyState title="No orders yet" description="Your future purchases will appear here after checkout." /> : <section className="orders-list" aria-label="Your orders">{orders.map((order) => <article className="order-summary" key={order.id}><div className="order-summary-heading"><div><p className="eyebrow">{order.orderNumber}</p><h2>{order.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</h2></div><span className="order-status sans">{formatStatus(order.status)}</span></div><div className="order-summary-items">{order.items.map((item) => <div className="order-summary-item sans" key={`${order.id}-${item.sku}`}><span>{item.productTitle} <small>× {item.quantity}</small></span><strong>{formatMoney(item.subtotal, order.currency)}</strong></div>)}{order.itemCount > order.items.length && <p className="muted sans">+ {order.itemCount - order.items.length} more item(s)</p>}</div><div className="order-summary-footer sans"><span>{order.itemCount} item(s) · {formatMoney(order.total, order.currency)}</span><Link className="text-link" href={`/orders/${order.id}`}>View details <span>→</span></Link></div></article>)}</section>}</main>;
}