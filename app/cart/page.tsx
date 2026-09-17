import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
export const metadata: Metadata = { title: "Your cart" };
export default function CartPage() { return <main className="cart-page container"><div className="page-intro"><p className="eyebrow">Almost yours</p><h1>Your cart</h1></div><CartView /></main>; }