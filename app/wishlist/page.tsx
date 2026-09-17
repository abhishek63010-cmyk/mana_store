import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist-view";

export const metadata: Metadata = { title: "Your wishlist" };
export default function WishlistPage() { return <main className="catalog-page container"><div className="page-intro"><p className="eyebrow">Saved for later</p><h1>Your wishlist</h1></div><WishlistView /></main>; }