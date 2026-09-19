import "server-only";
import { prisma } from "@/database/client";
import { mapProduct, type ProductRecord } from "@/lib/products/mapper";

const productInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  supplierProducts: { where: { availability: "IN_STOCK" as const, supplierStock: { gte: 1 } }, orderBy: { createdAt: "asc" as const }, take: 1 },
} as const;

export class CartQuantityError extends Error {
  constructor(message = "The requested quantity is not available.") {
    super(message);
    this.name = "CartQuantityError";
  }
}

export async function getCustomerProduct(productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: "PUBLISHED", category: { active: true } },
    include: productInclude,
  });
  return product ? mapProduct(product as ProductRecord) : null;
}

export async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { orderBy: { createdAt: "asc" }, include: { product: { include: productInclude } } } },
  });
  return cart?.items.map((item) => ({ product: mapProduct(item.product as ProductRecord), quantity: item.quantity })) ?? [];
}

export async function addCartItem(userId: string, productId: string, quantity: number) {
  const product = await getCustomerProduct(productId);
  if (!product || product.availability !== "IN_STOCK") return null;
  const availableQuantity = product.availableQuantity ?? 0;
  const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
  const existingItem = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } }, select: { quantity: true } });
  if ((existingItem && existingItem.quantity + quantity > availableQuantity) || (!existingItem && quantity > availableQuantity)) {
    throw new CartQuantityError(`Only ${availableQuantity} unit${availableQuantity === 1 ? "" : "s"} available.`);
  }
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity: { increment: quantity } },
  });
  return getCart(userId);
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (!cart) return [];
  const product = await getCustomerProduct(productId);
  if (!product || product.availability !== "IN_STOCK") {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  } else if (quantity > (product.availableQuantity ?? 0)) {
    const availableQuantity = product.availableQuantity ?? 0;
    throw new CartQuantityError(`Only ${availableQuantity} unit${availableQuantity === 1 ? "" : "s"} available.`);
  } else {
    await prisma.cartItem.updateMany({ where: { cartId: cart.id, productId }, data: { quantity } });
  }
  return getCart(userId);
}

export async function removeCartItem(userId: string, productId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  return getCart(userId);
}

export async function getWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: productInclude } },
  });
  return items.map((item) => mapProduct(item.product as ProductRecord));
}

export async function addWishlistItem(userId: string, productId: string) {
  const product = await getCustomerProduct(productId);
  if (!product) return null;
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });
  return getWishlist(userId);
}

export async function removeWishlistItem(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  return getWishlist(userId);
}