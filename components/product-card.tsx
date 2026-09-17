"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types/product";
import { useCart } from "@/components/cart-provider";
import { PriceDisplay } from "@/components/price-display";

export function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const available = product.availability === "IN_STOCK";
  return <article className="product-card">
    <div className="product-card-image"><Link href={`/products/${product.slug}`} aria-label={`View ${product.title}`}><Image className="product-image" src={product.images[0]} alt={product.title} width={640} height={800} /></Link><button className={wishlisted ? "wishlist active" : "wishlist"} type="button" aria-label={`${wishlisted ? "Remove" : "Add"} ${product.title} ${wishlisted ? "from" : "to"} wishlist`} onClick={() => setWishlisted(!wishlisted)}>{wishlisted ? "♥" : "♡"}</button>{discount > 0 ? <span className="discount-badge">{discount}% off</span> : null}</div>
    <div className="product-card-copy"><p className="eyebrow">{product.category}</p><h3><Link href={`/products/${product.slug}`}>{product.title}</Link></h3>{product.rating ? <p className="rating sans"><span>★ {product.rating}</span> <small>({product.reviewCount})</small></p> : null}<PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} /><p className={`availability ${available ? "available" : "unavailable"}`}>{available ? "In stock" : "Currently unavailable"}</p><button className="card-cart sans" type="button" disabled={!available} onClick={() => addItem(product)}>{available ? "Add to cart" : "Notify me"}</button></div>
  </article>;
}
