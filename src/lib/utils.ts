import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Generador de ids corto, sin dependencias nativas de Node (compatible con edge runtime). */
export function nanoid(size = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = "";
  for (let i = 0; i < size; i++) {
    id += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return id;
}
