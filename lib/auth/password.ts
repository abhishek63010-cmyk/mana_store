import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

function deriveKey(password: string, salt: string, keyLength: number, cost: number, blockSize: number, parallelization: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, { N: cost, r: blockSize, p: parallelization, maxmem: 32 * 1024 * 1024 }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey as Buffer);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await deriveKey(password, salt, KEY_LENGTH, COST, BLOCK_SIZE, PARALLELIZATION);
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, cost, blockSize, parallelization, salt, hash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !cost || !blockSize || !parallelization || !salt || !hash) return false;
  try {
    const derivedKey = await deriveKey(password, salt, hash.length / 2, Number(cost), Number(blockSize), Number(parallelization));
    const storedKey = Buffer.from(hash, "hex");
    return derivedKey.length === storedKey.length && timingSafeEqual(derivedKey, storedKey);
  } catch {
    return false;
  }
}