import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/authorization";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await requireUser();
  return <main className="account-page container"><div className="page-intro"><p className="eyebrow">Your space</p><h1>Hello, {user.name}</h1><p className="sans">Manage your account details and keep shopping at your pace.</p></div><div className="account-links"><Link className="account-link" href="/account/orders"><span><strong>My orders</strong><small>View order history and status</small></span><span aria-hidden="true">→</span></Link><Link className="account-link" href="/account/addresses"><span><strong>Saved addresses</strong><small>Manage your delivery details</small></span><span aria-hidden="true">→</span></Link></div><section className="account-details" aria-labelledby="account-details-heading"><p className="eyebrow" id="account-details-heading">Account details</p><dl><div><dt>Name</dt><dd>{user.name}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div>{user.phone && <div><dt>Phone</dt><dd>{user.phone}</dd></div>}<div><dt>Account type</dt><dd>{user.role === "ADMIN" ? "Administrator" : "Customer"}</dd></div></dl></section></main>;
}