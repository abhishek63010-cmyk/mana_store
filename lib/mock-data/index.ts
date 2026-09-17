import type { Category, Product } from "@/types/product";

const image = (name: string) => `/patterns/${name}.svg`;

export const categories: readonly Category[] = [
  { id: "cat-all", name: "All", slug: "all", description: "Browse the full catalogue.", image: image("banarasi"), active: true },
  { id: "cat-fashion", name: "Fashion", slug: "fashion", description: "Everyday style and occasion wear.", image: image("silk"), active: true },
  { id: "cat-sarees", name: "Sarees", slug: "sarees", parentId: "cat-fashion", description: "Comfortable, colourful drapes for every occasion.", image: image("banarasi"), active: true },
  { id: "cat-electronics", name: "Electronics", slug: "electronics", description: "Smart technology for your everyday.", image: image("peacock"), active: true },
  { id: "cat-home", name: "Home", slug: "home", description: "Useful things for a better home.", image: image("organza"), active: true },
  { id: "cat-appliances", name: "Appliances", slug: "appliances", description: "Helpful appliances, made simple.", image: image("cotton"), active: true },
  { id: "cat-beauty", name: "Beauty", slug: "beauty", description: "Small rituals, everyday essentials.", image: image("party"), active: true },
];

const sareeAttributes = (fabric: string, weave: string) => ({ Fabric: fabric, Weave: weave });
export const products: readonly Product[] = [
  { id: "af-001", title: "Marigold Banarasi Silk Saree", slug: "marigold-banarasi-silk-saree", description: "A warm marigold drape with a delicate floral jaal and a classic contrast border.", categoryId: "cat-sarees", category: "Sarees", price: 2890, compareAtPrice: 3490, images: [image("banarasi"), image("silk")], availability: "IN_STOCK", supplierSku: "AF-BAN-001", status: "PUBLISHED", rating: 4.6, reviewCount: 128, attributes: sareeAttributes("Silk", "Banarasi zari weave") },
  { id: "af-002", title: "Indigo Handloom Cotton Saree", slug: "indigo-handloom-cotton-saree", description: "Breathable cotton in a thoughtful indigo stripe, finished with a comfortable everyday drape.", categoryId: "cat-sarees", category: "Sarees", price: 1490, images: [image("cotton"), image("indigo")], availability: "IN_STOCK", supplierSku: "AF-COT-002", status: "PUBLISHED", rating: 4.4, reviewCount: 86, attributes: sareeAttributes("Cotton", "Handloom") },
  { id: "af-003", title: "Rosewood Soft Silk Saree", slug: "rosewood-soft-silk-saree", description: "A deep rosewood palette with a fluid texture and understated antique border.", categoryId: "cat-sarees", category: "Sarees", price: 3190, compareAtPrice: 3790, images: [image("silk"), image("rosewood")], availability: "IN_STOCK", supplierSku: "AF-SLK-003", status: "PUBLISHED", rating: 4.8, reviewCount: 64, attributes: sareeAttributes("Soft silk", "Plain weave") },
  { id: "af-004", title: "Pearl Garden Organza Saree", slug: "pearl-garden-organza-saree", description: "A translucent pearl base with botanical colour and a light, comfortable finish.", categoryId: "cat-sarees", category: "Sarees", price: 2390, images: [image("organza"), image("garden")], availability: "IN_STOCK", supplierSku: "AF-ORG-004", status: "PUBLISHED", rating: 4.3, reviewCount: 41, attributes: sareeAttributes("Organza", "Printed") },
  { id: "af-005", title: "Saffron Festive Silk Saree", slug: "saffron-festive-silk-saree", description: "A bright saffron silk with a fine woven border for celebrations and special moments.", categoryId: "cat-sarees", category: "Sarees", price: 2690, compareAtPrice: 3090, images: [image("party"), image("saffron")], availability: "IN_STOCK", supplierSku: "AF-PTY-005", status: "PUBLISHED", rating: 4.7, reviewCount: 73, attributes: sareeAttributes("Silk blend", "Woven border") },
  { id: "af-006", title: "Peacock Teal Banarasi Saree", slug: "peacock-teal-banarasi-saree", description: "Jewel-toned teal with a quiet peacock motif and a luminous border.", categoryId: "cat-sarees", category: "Sarees", price: 3290, images: [image("peacock"), image("banarasi")], availability: "IN_STOCK", supplierSku: "AF-BAN-006", status: "PUBLISHED", rating: 4.5, reviewCount: 39, attributes: sareeAttributes("Silk", "Banarasi zari weave") },
  { id: "af-007", title: "Blush Everyday Cotton Saree", slug: "blush-everyday-cotton-saree", description: "A gentle blush cotton with a comfortable drape and narrow border.", categoryId: "cat-sarees", category: "Sarees", price: 1290, images: [image("blush"), image("cotton")], availability: "IN_STOCK", supplierSku: "AF-COT-007", status: "PUBLISHED", rating: 4.2, reviewCount: 57, attributes: sareeAttributes("Cotton", "Handloom") },
  { id: "af-008", title: "Ruby Heritage Bridal Saree", slug: "ruby-heritage-bridal-saree", description: "A rich ruby red with heritage-inspired motifs and a broad zari border.", categoryId: "cat-sarees", category: "Sarees", price: 5990, compareAtPrice: 6990, images: [image("bridal"), image("ruby")], availability: "OUT_OF_STOCK", supplierSku: "AF-BRD-008", status: "OUT_OF_STOCK", rating: 4.9, reviewCount: 22, attributes: sareeAttributes("Kanjivaram silk", "Traditional zari") },
];

export const productRepository = {
  all: () => products,
  featured: () => products.slice(0, 4),
  newArrivals: () => products.slice(4, 8),
  bySlug: (slug: string) => products.find((product) => product.slug === slug),
  byCategory: (slug: string) => { const category = categories.find((item) => item.slug === slug); return category?.id === "cat-all" ? products : products.filter((product) => product.categoryId === category?.id); },
  search: (query: string) => { const normalized = query.trim().toLowerCase(); if (!normalized) return products; return products.filter((product) => [product.title, product.category, product.description, ...Object.values(product.attributes)].some((value) => value.toLowerCase().includes(normalized))); },
};
