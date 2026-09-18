import Link from "next/link";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();
  return <div className="admin-shell"><header className="admin-header"><div className="admin-header-inner"><Link href="/admin" className="admin-brand"><span>AF</span><strong>Admin Console</strong></Link><AdminNav user={user} /></div></header><div className="admin-body"><aside className="admin-sidebar"><p className="admin-kicker">Workspace</p><nav aria-label="Admin navigation"><Link href="/admin">Dashboard</Link><Link href="/admin/products">Products</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/suppliers">Suppliers</Link></nav><div className="admin-account"><strong>{user.name}</strong><span>{user.email}</span><span>Administrator</span></div></aside><main className="admin-main">{children}</main></div></div>;
}