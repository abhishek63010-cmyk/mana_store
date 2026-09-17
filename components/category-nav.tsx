import Link from "next/link";
import type { Category } from "@/types/product";

export function CategoryNav({ categories }: { categories: readonly Category[] }) { return <nav className="category-nav" aria-label="Product categories"><div className="container category-nav-inner">{categories.map((category) => <Link key={category.id} href={`/category/${category.slug}`}>{category.name}</Link>)}<Link href="/products">More</Link></div></nav>; }