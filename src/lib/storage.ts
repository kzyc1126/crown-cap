import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { ADMIN_IMAGE_MAX, formatBytes } from "@/lib/limits";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export type ImageFolder = "caps" | "gallery" | "uploads";

/**
 * Where uploaded images go. `local` writes into /public and is what runs on
 * this machine; `blob` uploads to Vercel Blob and is what runs on the deployed
 * site (its filesystem is read-only) — see the "Photo storage" section in
 * README.md. Set IMAGE_STORAGE=blob (plus BLOB_READ_WRITE_TOKEN) on Vercel.
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

/**
 * Upload to Vercel Blob and return the public CDN URL to store on the row.
 * Needs BLOB_READ_WRITE_TOKEN in the environment — Vercel sets it when a Blob
 * store is linked to the project. `filenameFor` already makes each path unique,
 * so Blob's default "do not overwrite" behaviour is what we want.
 */
async function storeInBlob(file: File, folder: ImageFolder, bytes: Buffer) {
  const { url } = await put(`${folder}/${filenameFor(file)}`, bytes, {
    access: "public",
    contentType: file.type,
  });
  return url;
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

  const bytes = Buffer.from(await file.arrayBuffer());

  let url: string;
  if (driver === "blob") {
    url = await storeInBlob(file, folder, bytes);
  } else if (driver === "local") {
    url = await storeLocally(file, folder, bytes);
  } else {
    throw new Error(
      `IMAGE_STORAGE="${driver}" is not a known driver — use "local" or "blob".`,
    );
  }

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
