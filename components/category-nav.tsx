import Link from "next/link";
import { categories } from "@/lib/mock-data";

export function CategoryNav() { return <nav className="category-nav" aria-label="Product categories"><div className="container category-nav-inner">{categories.filter((category) => category.active && !category.parentId).map((category) => <Link key={category.id} href={category.slug === "all" ? "/products" : `/category/${category.slug}`}>{category.name}</Link>)}<Link href="/products">More</Link></div></nav>; }