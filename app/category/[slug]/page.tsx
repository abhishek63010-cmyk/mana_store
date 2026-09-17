import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductToolbar } from "@/components/product-toolbar";
import { categories, productRepository } from "@/lib/mock-data";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const slug = (await params).slug; const category = categories.find((item) => item.slug === slug); return { title: category?.name ?? "Category", description: category?.description }; }
export default async function CategoryPage({ params }: Props) { const slug = (await params).slug; const category = categories.find((item) => item.slug === slug); if (!category) notFound(); const products = productRepository.byCategory(slug); return <main className="catalog-page container"><nav className="breadcrumbs sans" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{category.name}</span></nav><div className="page-intro"><p className="eyebrow">Category</p><h1>{category.name}</h1><p className="sans muted">{category.description}</p></div><ProductToolbar products={products} /></main>; }