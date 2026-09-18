import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardMetrics } from "@/lib/admin/service";

export const metadata: Metadata = { title: "Admin dashboard" };
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

export default async function AdminPage() {
  const metrics = await getDashboardMetrics();
  const cards = [["Products", metrics.products, "/admin/products"], ["Published", metrics.publishedProducts, "/admin/products"], ["Categories", metrics.categories, "/admin/categories"], ["Customers", metrics.customers, "/admin/orders"], ["Orders", metrics.orders, "/admin/orders"], ["Pending payment", metrics.pendingOrders, "/admin/orders"]] as const;
  return <><div className="admin-page-heading"><div><p className="admin-kicker">Overview</p><h1>Dashboard</h1><p>Live catalogue, customer, and order totals from PostgreSQL.</p></div></div><section className="admin-metric-grid" aria-label="Dashboard metrics">{cards.map(([label, value, href]) => <Link className="admin-metric" href={href} key={label}><span>{label}</span><strong>{value}</strong></Link>)}<div className="admin-metric admin-revenue"><span>Payment-confirmed revenue</span><strong>{money(metrics.capturedRevenue)}</strong><small>Captured payments only. Order totals are not treated as revenue.</small></div></section><section className="admin-panel admin-dashboard-note"><p className="admin-kicker">Operations</p><h2>Keep the catalogue intentional</h2><p>New products start as drafts. Publish only after their category, price, and image URLs have been reviewed.</p><Link className="admin-button" href="/admin/products/new">Create a product</Link></section></>;
}