import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { ProductToolbar } from "@/components/product-toolbar";
import { parsePage, parseSort } from "@/lib/products/query";
import { getPublishedProducts } from "@/lib/products/service";
export const metadata: Metadata = { title: "Shop all products" };
type Props = { searchParams: Promise<{ page?: string; sort?: string }> };
export default async function ProductsPage({ searchParams }: Props) { const params = await searchParams; const listing = await getPublishedProducts({ page: parsePage(params.page), sort: parseSort(params.sort) }); return <main className="catalog-page container"><nav className="breadcrumbs sans" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>All products</span></nav><div className="page-intro"><p className="eyebrow">Marketplace catalogue</p><h1>All products</h1><p className="sans muted">Browse products across every active category.</p></div><ProductToolbar products={listing.products} /><Pagination page={listing.page} totalPages={listing.totalPages} href={`/products?sort=${parseSort(params.sort)}`} /></main>; }