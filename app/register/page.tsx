import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return <main className="auth-page container"><div className="auth-panel"><p className="eyebrow">Join Abhi Fashions</p><h1>Create your account</h1><p className="auth-intro sans">Save your details for a smoother way to browse and shop.</p><AuthForm mode="register" /></div></main>;
}