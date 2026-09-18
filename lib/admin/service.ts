import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/database/client";

const productSelect = {
  id: true, title: true, slug: true, description: true, fabric: true, weaveType: true,
  sellingPrice: true, status: true, publishedAt: true, createdAt: true, updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: "asc" as const }, select: { id: true, imageUrl: true, altText: true, position: true } },
  _count: { select: { orderItems: true } },
} satisfies Prisma.ProductSelect;

const orderSelect = {
  id: true, orderNumber: true, createdAt: true, updatedAt: true, status: true, totalAmount: true, currency: true,
  shippingName: true, shippingPhone: true, shippingAddressLine1: true, shippingAddressLine2: true,
  shippingCity: true, shippingState: true, shippingPostalCode: true, shippingCountry: true,
  customer: { select: { id: true, name: true, email: true, _count: { select: { orders: true } } } },
  items: { orderBy: { createdAt: "asc" as const }, select: { id: true, productTitle: true, sku: true, quantity: true, unitSellingPrice: true, totalPrice: true } },
  payments: { orderBy: { createdAt: "desc" as const }, take: 1, select: { status: true, amount: true, currency: true } },
  shipments: { orderBy: { createdAt: "desc" as const }, take: 1, select: { carrier: true, trackingNumber: true, trackingUrl: true, status: true } },
} satisfies Prisma.OrderSelect;

export const adminOrderTransitions: Record<string, string[]> = {
  PENDING_PAYMENT: ["CANCELLED"], PAID: ["STOCK_CHECKING", "CANCELLED"], STOCK_CHECKING: ["PROCESSING", "CANCELLED"],
  SUPPLIER_ORDER_PENDING: ["PROCESSING", "CANCELLED"], SUPPLIER_ORDER_CREATED: ["PROCESSING", "CANCELLED"], PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"], DELIVERED: [], CANCELLED: [], REFUND_PENDING: [], REFUNDED: [], FAILED: [],
};

function productView(product: Prisma.ProductGetPayload<{ select: typeof productSelect }>) {
  return { ...product, sellingPrice: Number(product.sellingPrice), orderCount: product._count.orderItems, _count: undefined };
}

function orderView(order: Prisma.OrderGetPayload<{ select: typeof orderSelect }>) {
  return {
    ...order, total: Number(order.totalAmount), totalAmount: undefined,
    customer: { ...order.customer, orderCount: order.customer._count.orders, _count: undefined },
    items: order.items.map((item) => ({ ...item, unitSellingPrice: Number(item.unitSellingPrice), totalPrice: Number(item.totalPrice) })),
    payments: order.payments.map((payment) => ({ ...payment, amount: Number(payment.amount) })),
  };
}

export async function getDashboardMetrics() {
  const [products, publishedProducts, categories, customers, orders, pendingOrders, captured] = await Promise.all([
    prisma.product.count(), prisma.product.count({ where: { status: "PUBLISHED" } }), prisma.category.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }), prisma.order.count(), prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.payment.aggregate({ where: { status: "CAPTURED" }, _sum: { amount: true } }),
  ]);
  return { products, publishedProducts, categories, customers, orders, pendingOrders, capturedRevenue: captured._sum.amount ? Number(captured._sum.amount) : 0 };
}

export async function getAdminProducts(search = "") {
  const value = search.trim();
  const products = await prisma.product.findMany({ where: value ? { OR: [{ title: { contains: value, mode: "insensitive" } }, { slug: { contains: value, mode: "insensitive" } }] } : undefined, orderBy: { updatedAt: "desc" }, select: productSelect });
  return products.map(productView);
}

export async function getAdminProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, select: productSelect });
  return product ? productView(product) : null;
}

export async function getAdminCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
}

export async function getAdminCategory(id: string) {
  return prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
}

export async function getAdminOrders(search = "", status?: string) {
  const value = search.trim();
  const orders = await prisma.order.findMany({ where: { ...(status ? { status: status as never } : {}), ...(value ? { OR: [{ orderNumber: { contains: value, mode: "insensitive" } }, { customer: { email: { contains: value, mode: "insensitive" } } }] } : {}) }, orderBy: { createdAt: "desc" }, select: orderSelect });
  return orders.map(orderView);
}

export async function getAdminOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id }, select: orderSelect });
  return order ? orderView(order) : null;
}

export async function getAdminSuppliers() {
  return prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, code: true, active: true, createdAt: true, updatedAt: true, _count: { select: { supplierProducts: true, supplierOrders: true, syncLogs: true } } } });
}