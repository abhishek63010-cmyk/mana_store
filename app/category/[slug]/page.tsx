import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { ProductToolbar } from "@/components/product-toolbar";
import { parsePage, parseSort } from "@/lib/products/query";
import { getProductsByCategory } from "@/lib/products/service";
type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ page?: string; sort?: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const result = await getProductsByCategory((await params).slug, { limit: 1 }); return { title: result.category?.name ?? "Category", description: result.category?.description }; }
export default async function CategoryPage({ params, searchParams }: Props) { const slug = (await params).slug; const filters = searchParams ? await searchParams : {}; const sort = parseSort(filters.sort); const result = await getProductsByCategory(slug, { page: parsePage(filters.page), sort }); if (!result.category) notFound(); return <main className="catalog-page container"><nav className="breadcrumbs sans" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{result.category.name}</span></nav><div className="page-intro"><p className="eyebrow">Category</p><h1>{result.category.name}</h1><p className="sans muted">{result.category.description}</p></div><ProductToolbar products={result.products} /><Pagination page={result.page} totalPages={result.totalPages} href={`/category/${slug}?sort=${sort}`} /></main>; }