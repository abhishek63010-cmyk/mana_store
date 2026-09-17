import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/product";
export function CategoryCard({ category }: { category: Category }) { return <Link className="category-card" href={`/category/${category.slug}`}><Image src={category.image} alt="" width={500} height={280} /><div><p className="eyebrow">Collection</p><h3>{category.name}</h3><p className="sans">{category.description}</p></div></Link>; }