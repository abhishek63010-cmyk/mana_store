"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types/product";

export interface CartItem { product: Product; quantity: number; }
interface CartContextValue { items: CartItem[]; itemCount: number; totalQuantity: number; subtotal: number; refresh: () => Promise<void>; addItem: (product: Product, quantity?: number) => void; removeItem: (productId: string) => void; updateQuantity: (productId: string, quantity: number) => void; }
const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mana_guest_cart";

function limitQuantity(product: Product, quantity: number) { return Math.min(quantity, product.availableQuantity ?? quantity); }
function readGuestCart(): CartItem[] { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); return Array.isArray(value) ? value.flatMap((item) => { if (!item?.product?.id || !Number.isInteger(item.quantity) || item.quantity < 1) return []; const quantity = limitQuantity(item.product, item.quantity); return quantity > 0 ? [{ product: item.product, quantity }] : []; }) : []; } catch { return []; } }

export function CartProvider({ children, userId = null }: Readonly<{ children: React.ReactNode; userId?: string | null }>) {
  const [items, setItems] = useState<CartItem[]>([]);
  const ready = useRef(false);
  const previousUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    ready.current = false;
    async function load() {
      if (!userId) { if (!cancelled) setItems(readGuestCart()); ready.current = true; return; }
      const guestItems = readGuestCart();
      const response = await fetch("/api/cart", { cache: "no-store" });
      let loaded: CartItem[] = response.ok ? (await response.json()).items : [];
      if (guestItems.length && previousUserId.current !== userId) {
        for (const item of guestItems) {
          const mergeResponse = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: item.product.id, quantity: item.quantity }) });
          if (mergeResponse.ok) loaded = (await mergeResponse.json()).items;
        }
        localStorage.removeItem(STORAGE_KEY);
      }
      if (!cancelled) setItems(loaded);
      ready.current = true;
      previousUserId.current = userId;
    }
    void load();
    return () => { cancelled = true; };
  }, [userId]);
  useEffect(() => { if (!userId && ready.current) localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items, userId]);
  const value = useMemo(() => ({
    items, itemCount: items.reduce((total, item) => total + item.quantity, 0), totalQuantity: items.reduce((total, item) => item.product.availability === "IN_STOCK" ? total + item.quantity : total, 0), subtotal: items.reduce((total, item) => item.product.availability === "IN_STOCK" ? total + item.product.price * item.quantity : total, 0),
    refresh: async () => { if (!userId) { setItems([]); return; } const response = await fetch("/api/cart", { cache: "no-store" }); if (response.ok) setItems((await response.json()).items); },
    addItem: (product: Product, quantity = 1) => { if (quantity < 1) return; if (!userId) { setItems((current) => { const found = current.find((item) => item.product.id === product.id); const nextQuantity = limitQuantity(product, (found?.quantity ?? 0) + quantity); return nextQuantity < 1 ? current : found ? current.map((item) => item.product.id === product.id ? { ...item, quantity: nextQuantity } : item) : [...current, { product, quantity: nextQuantity }]; }); return; } void fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, quantity }) }).then(async (response) => { if (response.ok) setItems((await response.json()).items); }); },
    removeItem: (productId: string) => { if (!userId) { setItems((current) => current.filter((item) => item.product.id !== productId)); return; } void fetch(`/api/cart/${productId}`, { method: "DELETE" }).then(async (response) => { if (response.ok) setItems((await response.json()).items); }); },
    updateQuantity: (productId: string, quantity: number) => { if (quantity < 1) return; if (!userId) { setItems((current) => current.map((item) => item.product.id === productId ? { ...item, quantity: limitQuantity(item.product, quantity) } : item)); return; } void fetch(`/api/cart/${productId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity }) }).then(async (response) => { if (response.ok) setItems((await response.json()).items); }); },
  }), [items, userId]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider"); return context; }