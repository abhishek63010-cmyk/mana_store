import type { Metadata } from "next";
import Link from "next/link";
import { ProductToolbar } from "@/components/product-toolbar";
import { productRepository } from "@/lib/mock-data";
export const metadata: Metadata = { title: "Shop all products" };
export default function ProductsPage() { return <main className="catalog-page container"><nav className="breadcrumbs sans" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>All products</span></nav><div className="page-intro"><p className="eyebrow">Marketplace catalogue</p><h1>All products</h1><p className="sans muted">Browse fashion today, with more categories ready to join the store.</p></div><ProductToolbar products={productRepository.all()} /></main>; }