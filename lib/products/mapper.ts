import "server-only";
import type { Prisma } from "@prisma/client";
import type { Category, Product } from "@/types/product";

export type ProductRecord = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: { orderBy: { position: "asc" } };
  };
}>;

export function mapProduct(record: ProductRecord): Product {
  const attributes: Record<string, string> = {};

  if (record.fabric) attributes.Fabric = record.fabric;
  if (record.weaveType) attributes.Type = record.weaveType;

  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    description: record.description ?? "",
    categoryId: record.categoryId,
    category: record.category.name,
    categorySlug: record.category.slug,
    price: Number(record.sellingPrice),
    images: record.images.map((image) => image.imageUrl),
    availability: "IN_STOCK",
    supplierSku: "",
    status: record.status,
    attributes,
  };
}

export function mapCategory(record: { id: string; name: string; slug: string; description: string | null; active: boolean }): Category {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description ?? "",
    image: "/patterns/cotton.svg",
    active: record.active,
  };
}
