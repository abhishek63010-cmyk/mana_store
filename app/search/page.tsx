import type { Metadata } from "next";
import { Pagination } from "@/components/pagination";
import { ProductGrid } from "@/components/product-grid";
import { SearchBar } from "@/components/search-bar";
import { parsePage, parseSort, getQueryValue } from "@/lib/products/query";
import { searchProducts } from "@/lib/products/service";
export const metadata: Metadata = { title: "Search products" };
type Props = { searchParams: Promise<{ q?: string; page?: string; sort?: string }> };
export default async function SearchPage({ searchParams }: Props) { const params = await searchParams; const query = getQueryValue(params.q) ?? ""; const listing = await searchProducts(query, { page: parsePage(params.page), sort: parseSort(params.sort) }); return <main className="catalog-page container"><div className="search-intro"><p className="eyebrow">Find your next favourite</p><h1>Search</h1><SearchBar initialQuery={query} /><p className="sans muted">{query ? `${listing.total} result${listing.total === 1 ? "" : "s"} for “${query}”` : "Search by title, category, fabric, or weave."}</p></div><ProductGrid products={listing.products} /><Pagination page={listing.page} totalPages={listing.totalPages} href={`/search?q=${encodeURIComponent(query)}&sort=${parseSort(params.sort)}`} /></main>; }