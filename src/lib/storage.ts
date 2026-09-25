import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ADMIN_IMAGE_MAX, formatBytes } from "@/lib/limits";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export type ImageFolder = "caps" | "gallery" | "uploads";

/**
 * Where uploaded images go. `local` writes into /public and is what runs on
 * this machine; `blob` is the seam for a CDN (Vercel Blob, S3, R2) once the
 * site is deployed — see the "Photo storage" section in README.md.
 */
const driver = process.env.IMAGE_STORAGE ?? "local";

function filenameFor(file: File) {
  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  return `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${extension}`;
}

async function storeLocally(file: File, folder: ImageFolder, bytes: Buffer) {
  const name = filenameFor(file);
  const directory = path.join(process.cwd(), "public", folder);

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);

  return `/${folder}/${name}`;
}

/** Throws when the file is the wrong type or over `maxBytes`. */
export function assertImageAllowed(file: File, maxBytes: number) {
  if (!ALLOWED.has(file.type)) throw new Error(`Unsupported image type: ${file.type}`);
  if (file.size > maxBytes) {
    throw new Error(
      `“${file.name}” is ${formatBytes(file.size)} — the limit is ${formatBytes(maxBytes)}.`,
    );
  }
}

/**
 * Store an uploaded image and return the URL to save on the row, plus the
 * bytes that were written so a caller can attach them to an e-mail without
 * reading the file back off disk.
 *
 * Returns null when no file was chosen; throws when the file is rejected.
 */
export async function storeImageWithBytes(
  file: File | null,
  folder: ImageFolder,
  maxBytes: number = ADMIN_IMAGE_MAX,
): Promise<{ url: string; bytes: Buffer; type: string; name: string } | null> {
  if (!file || file.size === 0) return null;
  assertImageAllowed(file, maxBytes);

  if (driver !== "local") {
    throw new Error(
      `IMAGE_STORAGE="${driver}" has no driver yet — install the CDN package and add it in src/lib/storage.ts`,
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await storeLocally(file, folder, bytes);

  return { url, bytes, type: file.type, name: path.basename(url) };
}

/** Store an uploaded image and return only the URL to save on the row. */
export async function storeImage(
  file: File | null,
  folder: ImageFolder,
  maxBytes: number = ADMIN_IMAGE_MAX,
): Promise<string | null> {
  const stored = await storeImageWithBytes(file, folder, maxBytes);
  return stored?.url ?? null;
}
