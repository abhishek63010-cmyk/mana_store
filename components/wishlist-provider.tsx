"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types/product";

interface WishlistContextValue { products: Product[]; count: number; has: (productId: string) => boolean; toggle: (product: Product) => void; remove: (productId: string) => void; }
const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "mana_guest_wishlist";
function readGuestWishlist(): Product[] { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); return Array.isArray(value) ? value.filter((product) => product?.id) : []; } catch { return []; } }

export function WishlistProvider({ children, userId = null }: Readonly<{ children: React.ReactNode; userId?: string | null }>) {
  const [products, setProducts] = useState<Product[]>([]);
  const ready = useRef(false);
  useEffect(() => {
    let cancelled = false;
    ready.current = false;
    async function load() {
      const guestProducts = readGuestWishlist();
      if (!userId) { if (!cancelled) setProducts(guestProducts); ready.current = true; return; }
      const response = await fetch("/api/wishlist", { cache: "no-store" });
      let loaded: Product[] = response.ok ? (await response.json()).products : [];
      for (const product of guestProducts) {
        const mergeResponse = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
        if (mergeResponse.ok) loaded = (await mergeResponse.json()).products;
      }
      if (guestProducts.length) localStorage.removeItem(STORAGE_KEY);
      if (!cancelled) setProducts(loaded);
      ready.current = true;
    }
    void load();
    return () => { cancelled = true; };
  }, [userId]);
  useEffect(() => { if (!userId && ready.current) localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }, [products, userId]);
  const value = useMemo(() => ({
    products, count: products.length, has: (productId: string) => products.some((product) => product.id === productId),
    toggle: (product: Product) => { if (products.some((item) => item.id === product.id)) { if (!userId) setProducts((current) => current.filter((item) => item.id !== product.id)); else void fetch(`/api/wishlist/${product.id}`, { method: "DELETE" }).then(async (response) => { if (response.ok) setProducts((await response.json()).products); }); return; } if (!userId) { setProducts((current) => [...current, product]); return; } void fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) }).then(async (response) => { if (response.ok) setProducts((await response.json()).products); }); },
    remove: (productId: string) => { if (!userId) setProducts((current) => current.filter((product) => product.id !== productId)); else void fetch(`/api/wishlist/${productId}`, { method: "DELETE" }).then(async (response) => { if (response.ok) setProducts((await response.json()).products); }); },
  }), [products, userId]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error("useWishlist must be used inside WishlistProvider"); return context; }