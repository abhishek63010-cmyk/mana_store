"use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { Product } from "@/types/product";

export interface CartItem { product: Product; quantity: number; }
interface CartContextValue { items: CartItem[]; itemCount: number; subtotal: number; addItem: (product: Product) => void; removeItem: (productId: string) => void; updateQuantity: (productId: string, quantity: number) => void; }
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [items, setItems] = useState<CartItem[]>([]);
  const value = useMemo(() => ({ items, itemCount: items.reduce((total, item) => total + item.quantity, 0), subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0), addItem: (product: Product) => setItems((current) => { const found = current.find((item) => item.product.id === product.id); return found ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { product, quantity: 1 }]; }), removeItem: (productId: string) => setItems((current) => current.filter((item) => item.product.id !== productId)), updateQuantity: (productId: string, quantity: number) => setItems((current) => quantity < 1 ? current.filter((item) => item.product.id !== productId) : current.map((item) => item.product.id === productId ? { ...item, quantity } : item)) }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider"); return context; }