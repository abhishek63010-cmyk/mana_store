import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/database/client";

export type ProductSort = "featured" | "price-low" | "price-high" | "newest";
export type ProductQuery = {
  page?: number;
  limit?: number;
  sort?: ProductSort;
  categorySlug?: string;
  search?: string;
};

const productInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  supplierProducts: { where: { availability: "IN_STOCK" as const, supplierStock: { gte: 1 } }, orderBy: { createdAt: "asc" as const }, take: 1 },
} satisfies Prisma.ProductInclude;

const visibleProductWhere = {
  status: "PUBLISHED" as const,
  category: { active: true },
} satisfies Prisma.ProductWhereInput;

function getPagination(query: ProductQuery) {
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const limit = Math.min(48, Math.max(1, Math.floor(query.limit ?? 24)));
  return { limit, skip: (page - 1) * limit };
}

function getOrderBy(sort: ProductSort = "featured"): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-low":
      return [{ sellingPrice: "asc" }, { createdAt: "desc" }];
    case "price-high":
      return [{ sellingPrice: "desc" }, { createdAt: "desc" }];
    case "newest":
      return [{ publishedAt: "desc" }, { createdAt: "desc" }];
    default:
      return [{ publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

function buildWhere(query: ProductQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { ...visibleProductWhere };
  const search = query.search?.trim();

  if (query.categorySlug && query.categorySlug !== "all") {
    where.category = { is: { active: true, slug: query.categorySlug } };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { fabric: { contains: search, mode: "insensitive" } },
      { weaveType: { contains: search, mode: "insensitive" } },
      { category: { is: { active: true, name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  return where;
}

export const productRepository = {
  async getPublishedProducts(query: ProductQuery = {}) {
    const { limit, skip } = getPagination(query);
    return prisma.product.findMany({
      where: buildWhere(query),
      include: productInclude,
      orderBy: getOrderBy(query.sort),
      skip,
      take: limit,
    });
  },

  async countProducts(query: ProductQuery = {}) {
    return prisma.product.count({ where: buildWhere(query) });
  },

  async getProductBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { ...visibleProductWhere, slug },
      include: productInclude,
    });
  },

  async getProductsByCategory(slug: string, query: Omit<ProductQuery, "categorySlug"> = {}) {
    return this.getPublishedProducts({ ...query, categorySlug: slug });
  },

  async searchProducts(search: string, query: Omit<ProductQuery, "search"> = {}) {
    return this.getPublishedProducts({ ...query, search });
  },

  async getFeaturedProducts(limit = 4) {
    return prisma.product.findMany({
      where: visibleProductWhere,
      include: productInclude,
      orderBy: getOrderBy("featured"),
      take: Math.min(48, Math.max(1, limit)),
    });
  },

  async getActiveCategories() {
    return prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  },

  async getCategoryBySlug(slug: string) {
    return prisma.category.findFirst({ where: { active: true, slug } });
  },
};

export { getPagination };
