"use client";
import Link from "next/link";
import { useState } from "react";
import { CategoryNav } from "@/components/category-nav";
import { SearchBar } from "@/components/search-bar";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import type { Category } from "@/types/product";
import { AuthNav } from "@/components/auth-nav";
import type { SafeUser } from "@/lib/auth/session";

export function Header({ categories, user }: { categories: readonly Category[]; user: SafeUser | null }) {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  return <>
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href="/" onClick={() => setOpen(false)}><span className="brand-mark">M</span><span>ManaStore</span></Link>
      <div className="header-search"><SearchBar /></div>
      <nav className="account-nav sans" aria-label="Customer navigation"><AuthNav user={user} /><Link href="/wishlist">Wishlist <span>{wishlistCount}</span></Link><Link className="cart-link" href="/cart">Cart <span>{itemCount}</span></Link></nav>
      <button className="menu-toggle sans" type="button" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>Menu</button>
    </div><div className={open ? "mobile-nav open" : "mobile-nav"} id="mobile-nav"><div className="container">{categories.filter((category) => category.active && !category.parentId).map((category) => <Link key={category.id} href={category.slug === "all" ? "/products" : `/category/${category.slug}`} onClick={() => setOpen(false)}>{category.name}</Link>)}</div></div></header><CategoryNav categories={categories} />
  </>;
}
