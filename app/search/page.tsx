import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { SearchBar } from "@/components/search-bar";
import { productRepository } from "@/lib/mock-data";
export const metadata: Metadata = { title: "Search sarees" };
type Props = { searchParams: Promise<{ q?: string }> };
export default async function SearchPage({ searchParams }: Props) { const query = (await searchParams).q ?? ""; const results = productRepository.search(query); return <main className="catalog-page container"><div className="search-intro"><p className="eyebrow">Find your next favourite</p><h1>Search</h1><SearchBar initialQuery={query} /><p className="sans muted">{query ? `${results.length} result${results.length === 1 ? "" : "s"} for “${query}”` : "Search by title, category, fabric, or weave."}</p></div><ProductGrid products={results} /></main>; }