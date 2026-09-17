import Link from "next/link";
import { Button } from "@/components/button";
import { CategoryCard } from "@/components/category-card";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getFeaturedProducts, getPublishedProducts } from "@/lib/products/service";

export default async function HomePage() {
	const [categories, featured, newArrivals] = await Promise.all([getCategories(), getFeaturedProducts(), getPublishedProducts({ sort: "newest", limit: 4 })]);
	return <main>
	<section className="market-hero"><div className="container market-hero-inner"><div><p className="eyebrow">Welcome to Abhi Fashions</p><h1>Good products.<br /><em>Easy shopping.</em></h1><p className="sans">Explore everyday fashion today, with more useful categories joining soon.</p><Button href="/products">Start shopping</Button></div><div className="hero-offer sans"><strong>Fresh picks</strong><span>Up to 30% off</span><small>On selected fashion styles</small></div></div></section>
	<section className="quick-categories"><div className="container"><div className="section-heading"><div><p className="eyebrow">Browse faster</p><h2>Shop by category</h2></div><Link className="text-link sans" href="/products">View all →</Link></div><div className="category-grid">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}</div></div></section>
	<section className="deal-strip"><div className="container deal-content"><div><p className="eyebrow">Today&apos;s deals</p><h2>Style that fits<br /><em>your day.</em></h2></div><div className="deal-points sans"><span><strong>₹1,290+</strong> starting prices</span><span><strong>Top rated</strong> customer picks</span><span><strong>Easy browsing</strong> on every screen</span></div><Button href="/category/sarees">See deals</Button></div></section>
	<section className="section marketplace-products"><div className="container"><div className="section-heading"><div><p className="eyebrow">Popular right now</p><h2>Featured products</h2></div><Link className="text-link sans" href="/products">Shop all →</Link></div><ProductGrid products={featured} /></div></section>
	<section className="section trending"><div className="container"><div className="section-heading"><div><p className="eyebrow">Keep browsing</p><h2>Trending picks</h2></div></div><ProductGrid products={newArrivals.products} /></div></section>
	<section className="trust"><div className="container trust-grid"><div><strong>Clear prices</strong><p className="sans muted">See selling price, original price, and savings at a glance.</p></div><div><strong>Useful details</strong><p className="sans muted">Ratings, availability, and product attributes help you choose.</p></div><div><strong>More to come</strong><p className="sans muted">The store is ready for electronics, home, appliances, and more.</p></div></div></section>
</main>;
}
