import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { PriceDisplay } from "@/components/price-display";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ProductWishlistButton } from "@/components/product-wishlist-button";
import { getProductBySlug } from "@/lib/products/service";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const product = await getProductBySlug((await params).slug); return { title: product?.title ?? "Product", description: product?.description }; }
function parseSpecifications(description: string) {
	return description
		.split(".")
		.map((item) => item.trim())
		.filter((item) => item.includes(": ") && !/supplier price|full catalogue price/i.test(item))
		.map((item) => { const separator = item.indexOf(": "); return { label: item.slice(0, separator), value: item.slice(separator + 2) }; });
}

function customerDescription(description: string) {
	return description.split(".").filter((item) => !/supplier price|full catalogue price/i.test(item)).join(".").trim();
}

export default async function ProductPage({ params }: Props) {
	const product = await getProductBySlug((await params).slug);
	if (!product) notFound();
	const specifications = parseSpecifications(product.description);
	const visibleDescription = customerDescription(product.description);
	const availability = product.status === "PUBLISHED" ? "Available on storefront" : product.availability === "OUT_OF_STOCK" ? "Currently unavailable" : "Availability not provided";

	return (
		<main className="product-detail container">
			<nav className="breadcrumbs sans" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={`/category/${product.categorySlug ?? product.category.toLowerCase()}`}>{product.category}</Link><span>/</span><span>{product.title}</span></nav>
			<ProductImageGallery images={product.images} title={product.title} />
			<section className="product-info">
				<p className="eyebrow">{product.category}</p>
				<h1>{product.title}</h1>
				<PriceDisplay price={product.price} />
				<p className={`detail-availability sans ${product.status === "PUBLISHED" ? "available" : "unavailable"}`}><span aria-hidden="true">●</span> {availability}</p>
				<div className="product-actions"><ProductWishlistButton product={product} /><AddToCart product={product} /></div>
				<section className="detail-section" aria-labelledby="description-heading"><h2 id="description-heading">About this product</h2><p className="detail-description sans">{visibleDescription}</p></section>
				{specifications.length ? <section className="detail-section" aria-labelledby="specifications-heading"><h2 id="specifications-heading">Specifications</h2><dl className="product-specs sans">{specifications.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section> : null}
			</section>
		</main>
	);
}