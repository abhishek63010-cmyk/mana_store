import "server-only";
import { AppError } from "@/lib/errors";
import { mapCategory, mapProduct } from "@/lib/products/mapper";
import { productRepository, type ProductQuery } from "@/lib/products/repository";

function handleDatabaseError(error: unknown): never {
  console.error("Product data access failed", error);
  throw new AppError("The product catalogue is temporarily unavailable.", "PRODUCT_CATALOGUE_UNAVAILABLE", 503);
}

async function safely<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleDatabaseError(error);
  }
}

function normalizeQuery(query: ProductQuery): ProductQuery {
  return {
    ...query,
    page: Number.isFinite(query.page) ? Math.max(1, Math.floor(query.page as number)) : 1,
    limit: Number.isFinite(query.limit) ? Math.min(48, Math.max(1, Math.floor(query.limit as number))) : 24,
  };
}

export async function getPublishedProducts(query: ProductQuery = {}) {
  const normalized = normalizeQuery(query);
  const [records, total] = await safely(() => Promise.all([
    productRepository.getPublishedProducts(normalized),
    productRepository.countProducts(normalized),
  ]));
  const limit = normalized.limit ?? 24;
  return { products: records.map(mapProduct), total, page: normalized.page ?? 1, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProductBySlug(slug: string) {
  const record = await safely(() => productRepository.getProductBySlug(slug));
  return record ? mapProduct(record) : null;
}

export async function getProductsByCategory(slug: string, query: Omit<ProductQuery, "categorySlug"> = {}) {
  const normalized = normalizeQuery(query);
  const [category, records, total] = await safely(() => Promise.all([
    productRepository.getCategoryBySlug(slug),
    productRepository.getProductsByCategory(slug, normalized),
    productRepository.countProducts({ ...normalized, categorySlug: slug }),
  ]));
  return { category: category ? mapCategory(category) : null, products: records.map(mapProduct), total, page: normalized.page ?? 1, limit: normalized.limit ?? 24, totalPages: Math.ceil(total / (normalized.limit ?? 24)) };
}

export async function searchProducts(search: string, query: Omit<ProductQuery, "search"> = {}) {
  const normalized = normalizeQuery(query);
  const [records, total] = await safely(() => Promise.all([
    productRepository.searchProducts(search, normalized),
    productRepository.countProducts({ ...normalized, search }),
  ]));
  const limit = normalized.limit ?? 24;
  return { products: records.map(mapProduct), total, page: normalized.page ?? 1, limit, totalPages: Math.ceil(total / limit) };
}

export async function getFeaturedProducts(limit = 4) {
  const records = await safely(() => productRepository.getFeaturedProducts(limit));
  return records.map(mapProduct);
}

export async function getCategories() {
  const records = await safely(() => productRepository.getActiveCategories());
  return records.map(mapCategory);
}
