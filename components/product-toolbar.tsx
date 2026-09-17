"use client";
import { useState } from "react";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product-grid";

export function ProductToolbar({ products }: { products: readonly Product[] }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  return <><div className="listing-toolbar sans"><button type="button" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>☰ Filters</button><span>{products.length} products</span><label>Sort by <select defaultValue="featured" onChange={(event) => { const url = new URL(window.location.href); url.searchParams.set("sort", event.target.value); url.searchParams.delete("page"); window.location.assign(url.toString()); }}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="newest">Newest</option></select></label></div>{filtersOpen ? <div className="filter-panel sans"><strong>Filter foundation</strong><span>Category, price, availability and attributes can be connected here later.</span></div> : null}<ProductGrid products={products} /></>;
}
