import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return <main className="auth-page container"><div className="auth-panel"><p className="eyebrow">Welcome back</p><h1>Login to your account</h1><p className="auth-intro sans">View your account details and keep your shopping journey in one place.</p><AuthForm mode="login" /></div></main>;
}