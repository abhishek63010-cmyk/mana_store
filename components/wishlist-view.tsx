"use client";

import { Button } from "@/components/button";
import { ProductGrid } from "@/components/product-grid";
import { useWishlist } from "@/components/wishlist-provider";

export function WishlistView() {
  const { products } = useWishlist();
  if (!products.length) return <div className="empty-cart"><h2>Your wishlist is waiting.</h2><p className="sans muted">Save products here while you browse.</p><Button href="/products">Browse products</Button></div>;
  return <ProductGrid products={products} />;
}