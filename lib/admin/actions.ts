"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/database/client";
import { requireAdmin } from "@/lib/auth/authorization";
import { adminOrderTransitions } from "@/lib/admin/service";
import { categoryInputSchema, orderStatusInputSchema, productInputSchema } from "@/validations/admin";

function formValue(formData: FormData, key: string) { return String(formData.get(key) ?? ""); }
function optional(value: string) { return value || undefined; }
function parseImageUrls(value: string) {
  const urls = value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  if (urls.some((url) => { try { const parsed = new URL(url); return !["http:", "https:"].includes(parsed.protocol); } catch { return true; } })) throw new Error("Each image must be a valid HTTP or HTTPS URL.");
  return urls;
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const input = productInputSchema.parse({ id: optional(formValue(formData, "id")), title: formValue(formData, "title"), slug: formValue(formData, "slug"), description: formValue(formData, "description"), categoryId: formValue(formData, "categoryId"), fabric: formValue(formData, "fabric"), weaveType: formValue(formData, "weaveType"), sellingPrice: formValue(formData, "sellingPrice"), status: formValue(formData, "status") || "DRAFT", imageUrls: formValue(formData, "imageUrls") });
  const imageUrls = parseImageUrls(input.imageUrls ?? "");
  const data = { title: input.title, slug: input.slug, description: optional(input.description ?? ""), categoryId: input.categoryId, fabric: optional(input.fabric ?? ""), weaveType: optional(input.weaveType ?? ""), sellingPrice: input.sellingPrice, status: input.status, publishedAt: input.status === "PUBLISHED" ? new Date() : null };
  const product = await prisma.$transaction(async (tx) => {
    const saved = input.id ? await tx.product.update({ where: { id: input.id }, data, select: { id: true } }) : await tx.product.create({ data, select: { id: true } });
    await tx.productImage.deleteMany({ where: { productId: saved.id } });
    if (imageUrls.length) await tx.productImage.createMany({ data: imageUrls.map((imageUrl, position) => ({ productId: saved.id, imageUrl, position })) });
    return saved;
  });
  revalidatePath("/admin/products"); revalidatePath(`/admin/products/${product.id}`); revalidatePath("/products");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const input = categoryInputSchema.parse({ id: optional(formValue(formData, "id")), name: formValue(formData, "name"), slug: formValue(formData, "slug"), description: formValue(formData, "description"), active: formData.get("active") === "on" });
  const data = { name: input.name, slug: input.slug, description: optional(input.description ?? ""), active: input.active };
  if (input.id) await prisma.category.update({ where: { id: input.id }, data }); else await prisma.category.create({ data });
  revalidatePath("/admin/categories"); revalidatePath("/");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const input = orderStatusInputSchema.parse({ orderId: formValue(formData, "orderId"), status: formValue(formData, "status") });
  const current = await prisma.order.findUnique({ where: { id: input.orderId }, select: { status: true } });
  if (!current) throw new Error("Order not found.");
  if (!adminOrderTransitions[current.status]?.includes(input.status)) throw new Error(`Cannot change an order from ${current.status} to ${input.status}.`);
  await prisma.order.update({ where: { id: input.orderId }, data: { status: input.status } });
  revalidatePath("/admin/orders"); revalidatePath(`/admin/orders/${input.orderId}`);
}