import { del, list, put } from "@vercel/blob";
import { mkdir, readdir, rm, writeFile } from "fs/promises";
import path from "path";
import { ApiError } from "@/server/http/errors";
import { COVER_EXTENSION, COVER_MIME_TYPES } from "@/shared/validation/book";
import { LIMITS } from "@/shared/validation/limits";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "covers");

/** Vercel names a store's token `BLOB_READ_WRITE_TOKEN`, or `<PREFIX>_READ_WRITE_TOKEN` when the store was
 *  connected with a prefix — accept either, so the exact name chosen in the dashboard doesn't matter. */
function blobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const key = Object.keys(process.env).find((k) => k.endsWith("_READ_WRITE_TOKEN") && process.env[k]);
  return key ? process.env[key] : undefined;
}

/** With a Vercel Blob token configured (production), covers live in Blob storage; without one (local development
 *  and the tests) they stay on local disk. Serverless hosts have no writable disk, so production needs the token. */
const useBlob = () => Boolean(blobToken());

function isAllowedMime(type: string): type is (typeof COVER_MIME_TYPES)[number] {
  return (COVER_MIME_TYPES as readonly string[]).includes(type);
}

const blobPrefix = (userId: string, bookId: string) => `covers/${userId}/${bookId}`;

/** Best-effort cleanup: removes any file already on disk for this book, regardless of its extension, so
 *  switching image types (or deleting the book) never leaves an orphaned file behind. */
async function removeExistingDiskCover(dir: string, bookId: string) {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  await Promise.all(entries.filter((name) => name.startsWith(`${bookId}.`)).map((name) => rm(path.join(dir, name), { force: true })));
}

async function removeExistingBlobCovers(userId: string, bookId: string, except?: string) {
  const token = blobToken();
  const { blobs } = await list({ prefix: blobPrefix(userId, bookId), token });
  const stale = blobs.map((b) => b.url).filter((url) => url !== except);
  if (stale.length > 0) await del(stale, { token });
}

/** Deletes whatever uploaded cover exists for a book (a no-op if it never had one, or its cover was an external
 *  URL rather than an upload) — called when the book itself is deleted. */
export async function deleteCoverUpload(userId: string, bookId: string): Promise<void> {
  if (useBlob()) {
    try {
      await removeExistingBlobCovers(userId, bookId);
    } catch {
      // Best-effort: the book is already gone; an orphaned image must not turn that into an error.
    }
    return;
  }
  await removeExistingDiskCover(path.join(UPLOAD_ROOT, userId), bookId);
}

/**
 * Saves an uploaded cover ("Add Photo"), replacing whatever was there before, and returns the URL to store as the
 * book's `coverUrl`: a Vercel Blob URL in production, or a path under public/uploads/covers/<userId>/ on local disk.
 */
export async function saveCoverUpload(userId: string, bookId: string, file: File): Promise<string> {
  if (!isAllowedMime(file.type)) throw new ApiError("COVER_INVALID_TYPE", 415);
  if (file.size > LIMITS.bookCoverMaxBytes) throw new ApiError("COVER_TOO_LARGE", 413);

  const extension = COVER_EXTENSION[file.type];

  if (useBlob()) {
    // A fresh random suffix gives every upload its own URL, so browsers never show the previous cover from cache.
    const blob = await put(`${blobPrefix(userId, bookId)}${extension}`, file, { access: "public", contentType: file.type, token: blobToken() });
    await removeExistingBlobCovers(userId, bookId, blob.url);
    return blob.url;
  }

  const dir = path.join(UPLOAD_ROOT, userId);
  await mkdir(dir, { recursive: true });
  await removeExistingDiskCover(dir, bookId);

  const filename = `${bookId}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/covers/${userId}/${filename}`;
}
