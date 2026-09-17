"use client";
import { useState } from "react";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product-grid";

export function ProductToolbar({ products }: { products: readonly Product[] }) {
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sorted = [...products].sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "rating" ? (b.rating ?? 0) - (a.rating ?? 0) : 0);
  return <><div className="listing-toolbar sans"><button type="button" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>☰ Filters</button><span>{products.length} products</span><label>Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label></div>{filtersOpen ? <div className="filter-panel sans"><strong>Filter foundation</strong><span>Category, price, availability and attributes can be connected here later.</span></div> : null}<ProductGrid products={sorted} /></>;
}
