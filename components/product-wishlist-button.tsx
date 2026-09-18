"use client";

import { useWishlist } from "@/components/wishlist-provider";
import type { Product } from "@/types/product";

export function ProductWishlistButton({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);

  return (
    <button
      className={`product-wishlist${saved ? " active" : ""}`}
      type="button"
      aria-label={saved ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
      aria-pressed={saved}
      onClick={() => toggle(product)}
    >
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
      {saved ? "Saved" : "Wishlist"}
    </button>
  );
}