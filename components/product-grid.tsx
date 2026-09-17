import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/states";
export function ProductGrid({ products }: { products: readonly Product[] }) { if (!products.length) return <EmptyState title="No products found" description="The catalogue is currently empty. Please check back soon." />; return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>; }