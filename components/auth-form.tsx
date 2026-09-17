"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    const next = searchParams.get("next");
    router.push(next?.startsWith("/") ? next : "/account");
    router.refresh();
  }

  return <form className="auth-form" onSubmit={submit} noValidate>
    {isRegister && <label>Name<input name="name" autoComplete="name" required /></label>}
    <label>Email<input name="email" type="email" autoComplete="email" required /></label>
    {isRegister && <label>Phone <span className="muted">(optional)</span><input name="phone" type="tel" autoComplete="tel" /></label>}
    <label>Password<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : 1} required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="sans button button-primary" type="submit" disabled={loading}>{loading ? "Please wait..." : isRegister ? "Create account" : "Login"}</button>
    <p className="auth-switch sans">{isRegister ? "Already have an account?" : "New to Abhi Fashions?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Login" : "Create an account"}</Link></p>
  </form>;
}