import type { ProductSort } from "@/lib/products/repository";

export function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(getQueryValue(value) ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function parseSort(value: string | string[] | undefined): ProductSort {
  const sort = getQueryValue(value);
  return sort === "price-low" || sort === "price-high" || sort === "newest" ? sort : "featured";
}
