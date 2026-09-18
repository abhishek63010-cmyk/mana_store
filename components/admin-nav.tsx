"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SafeUser } from "@/lib/auth/session";

export function AdminNav({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  return <div className="admin-mobile-nav"><button className="admin-menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>Menu</button><div className={`admin-mobile-links${open ? " open" : ""}`}><Link href="/admin">Dashboard</Link><Link href="/admin/products">Products</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/suppliers">Suppliers</Link><span className="admin-mobile-user">{user.name}</span><button type="button" onClick={logout}>Logout</button></div></div>;
}