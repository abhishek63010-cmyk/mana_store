import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import { addressFields, createAddressInTransaction, listAddresses } from "@/lib/addresses/service";
import type { CheckoutInput } from "@/validations/checkout";

export class CheckoutError extends Error {
  constructor(public readonly code: "EMPTY_CART" | "ADDRESS_NOT_FOUND" | "UNAVAILABLE", message: string) {
    super(message);
  }
}

export async function getCheckoutSnapshot(userId: string) {
  const [addresses, cart] = await Promise.all([
    listAddresses(userId),
    prisma.cart.findUnique({ where: { userId }, include: { items: { orderBy: { createdAt: "asc" }, include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true, supplierProducts: { where: { availability: "IN_STOCK", supplierStock: { gte: 1 } }, orderBy: { createdAt: "asc" }, take: 1 } } } } } } }),
  ]);
  return {
    addresses,
    items: cart?.items.map((item) => ({
      productId: item.productId,
      title: item.product.title,
      price: Number(item.product.sellingPrice),
      quantity: item.quantity,
      image: item.product.images[0]?.imageUrl ?? "/patterns/cotton.svg",
      available: item.product.status === "PUBLISHED" && Boolean(item.product.supplierProducts[0]) && item.product.supplierProducts[0].supplierStock >= item.quantity && item.quantity > 0 && Number.isInteger(item.quantity),
    })) ?? [],
  };
}

export async function createOrder(userId: string, input: CheckoutInput) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { orderBy: { createdAt: "asc" }, include: { product: { include: { supplierProducts: { where: { availability: "IN_STOCK", supplierStock: { gte: 1 } }, orderBy: { createdAt: "asc" }, take: 1 } } } } } },
    });
    if (!cart?.items.length) throw new CheckoutError("EMPTY_CART", "Your cart is empty.");

    const address = input.addressId
      ? await tx.address.findFirst({ where: { id: input.addressId, userId }, select: addressFields })
      : input.address ? await createAddressInTransaction(tx, userId, { ...input.address, isDefault: false }) : null;
    if (!address) throw new CheckoutError("ADDRESS_NOT_FOUND", "That shipping address is not available.");

    const items = cart.items.map((item) => {
      const supplierProduct = item.product.supplierProducts[0];
      if (item.quantity < 1 || !Number.isInteger(item.quantity) || item.product.status !== "PUBLISHED" || !supplierProduct || supplierProduct.supplierStock < item.quantity) {
        throw new CheckoutError("UNAVAILABLE", `${item.product.title} is no longer available in the requested quantity.`);
      }
      const price = new Prisma.Decimal(item.product.sellingPrice);
      return { productId: item.productId, supplierProductId: supplierProduct.id, productTitle: item.product.title, sku: supplierProduct.supplierSku, quantity: item.quantity, unitSellingPrice: price, totalPrice: price.mul(item.quantity) };
    });
    const subtotal = items.reduce((total, item) => total.add(item.totalPrice), new Prisma.Decimal(0));
    const order = await tx.order.create({
      data: {
        orderNumber: `AF-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        customerId: userId, shippingAddressId: address.id, shippingName: address.name, shippingPhone: address.phone,
        shippingAddressLine1: address.addressLine1, shippingAddressLine2: address.addressLine2, shippingCity: address.city,
        shippingState: address.state, shippingPostalCode: address.postalCode, shippingCountry: address.country,
        subtotal, shippingAmount: 0, discountAmount: 0, totalAmount: subtotal, currency: "INR", status: "PENDING_PAYMENT",
        items: { create: items },
      },
      select: { id: true, orderNumber: true },
    });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

const orderListSelect = {
  id: true, orderNumber: true, createdAt: true, status: true, totalAmount: true, currency: true,
  items: {
    take: 3,
    orderBy: { createdAt: "asc" as const },
    select: { productTitle: true, sku: true, quantity: true, totalPrice: true },
  },
  _count: { select: { items: true } },
} as const;

export type OrderListView = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
  items: { productTitle: string; sku: string; quantity: number; subtotal: number }[];
};

export type OrderDetailView = Omit<OrderListView, "items"> & {
  items: { id: string; productTitle: string; sku: string; quantity: number; unitPrice: number; subtotal: number }[];
  shippingAddress: { name: string; phone: string; line1: string; line2: string | null; city: string; state: string; postalCode: string; country: string };
  paymentStatus: string | null;
  shipments: { carrier: string | null; trackingNumber: string | null; trackingUrl: string | null; status: string; estimatedDelivery: Date | null; shippedAt: Date | null; deliveredAt: Date | null }[];
};

function toOrderListView(order: Awaited<ReturnType<typeof prisma.order.findMany<{ where: never; select: typeof orderListSelect }>>>[number]): OrderListView {
  return {
    id: order.id, orderNumber: order.orderNumber, createdAt: order.createdAt, status: order.status,
    total: Number(order.totalAmount), currency: order.currency, itemCount: order._count.items,
    items: order.items.map((item) => ({ productTitle: item.productTitle, sku: item.sku, quantity: item.quantity, subtotal: Number(item.totalPrice) })),
  };
}

export async function getOrdersForUser(userId: string): Promise<OrderListView[]> {
  const orders = await prisma.order.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    select: orderListSelect,
  });
  return orders.map(toOrderListView);
}

export async function getOrderForUser(orderId: string, userId: string): Promise<OrderDetailView | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: userId },
    select: {
      id: true, orderNumber: true, createdAt: true, status: true, totalAmount: true, currency: true,
      shippingName: true, shippingPhone: true, shippingAddressLine1: true, shippingAddressLine2: true,
      shippingCity: true, shippingState: true, shippingPostalCode: true, shippingCountry: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: { id: true, productTitle: true, sku: true, quantity: true, unitSellingPrice: true, totalPrice: true },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } },
      shipments: { orderBy: { createdAt: "desc" }, select: { carrier: true, trackingNumber: true, trackingUrl: true, status: true, estimatedDelivery: true, shippedAt: true, deliveredAt: true } },
    },
  });
  if (!order) return null;
  return {
    id: order.id, orderNumber: order.orderNumber, createdAt: order.createdAt, status: order.status,
    total: Number(order.totalAmount), currency: order.currency,
    itemCount: order.items.reduce((count, item) => count + item.quantity, 0),
    items: order.items.map((item) => ({ id: item.id, productTitle: item.productTitle, sku: item.sku, quantity: item.quantity, unitPrice: Number(item.unitSellingPrice), subtotal: Number(item.totalPrice) })),
    shippingAddress: { name: order.shippingName, phone: order.shippingPhone, line1: order.shippingAddressLine1, line2: order.shippingAddressLine2, city: order.shippingCity, state: order.shippingState, postalCode: order.shippingPostalCode, country: order.shippingCountry },
    paymentStatus: order.payments[0]?.status ?? null,
    shipments: order.shipments,
  };
}
