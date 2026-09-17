"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SafeUser } from "@/lib/auth/session";

export function AuthNav({ user }: { user: SafeUser | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  if (!user) return <><Link href="/login">Login</Link><Link href="/register">Register</Link></>;
  return <><Link href="/account">Account</Link><button className="account-logout" type="button" onClick={logout} disabled={loading}>{loading ? "Logging out..." : "Logout"}</button></>;
}