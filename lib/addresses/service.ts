import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import type { AddressInput } from "@/validations/checkout";

export const addressFields = {
  id: true, name: true, phone: true, addressLine1: true, addressLine2: true,
  city: true, state: true, postalCode: true, country: true, isDefault: true,
} as const;

type AddressDb = Pick<typeof prisma, "address">;

export async function listAddresses(userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }], select: addressFields });
}

export async function createAddress(userId: string, input: AddressInput) {
  return prisma.$transaction(async (tx) => createAddressInTransaction(tx, userId, input));
}

export async function createAddressInTransaction(db: AddressDb, userId: string, input: AddressInput) {
  const addressCount = await db.address.count({ where: { userId } });
  const isDefault = input.isDefault || addressCount === 0;
  if (isDefault) await db.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  return db.address.create({ data: { ...input, addressLine2: input.addressLine2 || null, userId, isDefault }, select: addressFields });
}

export async function updateAddress(userId: string, addressId: string, input: AddressInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id: addressId, userId }, select: { id: true } });
    if (!existing) return null;
    if (input.isDefault) await tx.address.updateMany({ where: { userId, id: { not: addressId }, isDefault: true }, data: { isDefault: false } });
    return tx.address.update({ where: { id: addressId }, data: { ...input, addressLine2: input.addressLine2 || null }, select: addressFields });
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const existing = await prisma.address.findFirst({ where: { id: addressId, userId }, select: { id: true } });
  if (!existing) return false;
  await prisma.address.delete({ where: { id: addressId } });
  return true;
}

export async function setDefaultAddress(userId: string, addressId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id: addressId, userId }, select: { id: true } });
    if (!existing) return null;
    await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return tx.address.update({ where: { id: addressId }, data: { isDefault: true }, select: addressFields });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}