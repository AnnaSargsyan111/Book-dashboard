import { mkdir, readdir, rm, writeFile } from "fs/promises";
import path from "path";
import { ApiError } from "@/server/http/errors";
import { COVER_EXTENSION, COVER_MIME_TYPES } from "@/shared/validation/book";
import { LIMITS } from "@/shared/validation/limits";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "covers");

function isAllowedMime(type: string): type is (typeof COVER_MIME_TYPES)[number] {
  return (COVER_MIME_TYPES as readonly string[]).includes(type);
}

/** Best-effort cleanup: removes any file already on disk for this book, regardless of its extension, so
 *  switching image types (or deleting the book) never leaves an orphaned file behind. */
async function removeExistingCover(dir: string, bookId: string) {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  await Promise.all(entries.filter((name) => name.startsWith(`${bookId}.`)).map((name) => rm(path.join(dir, name), { force: true })));
}

/** Deletes whatever local cover file exists for a book (a no-op if it never had one, or its cover was an
 *  external URL rather than an upload) — called when the book itself is deleted. */
export async function deleteCoverUpload(userId: string, bookId: string): Promise<void> {
  await removeExistingCover(path.join(UPLOAD_ROOT, userId), bookId);
}

/**
 * Saves an uploaded cover ("Add Photo") to disk under public/uploads/covers/<userId>/<bookId><ext>, replacing
 * whatever was there before. Returns the public path to store as the book's `coverUrl`. Local disk storage is a
 * deliberate, dev-scale choice — this project has no cloud object storage set up, and none is needed until
 * deployment is actually on the table.
 */
export async function saveCoverUpload(userId: string, bookId: string, file: File): Promise<string> {
  if (!isAllowedMime(file.type)) throw new ApiError("COVER_INVALID_TYPE", 415);
  if (file.size > LIMITS.bookCoverMaxBytes) throw new ApiError("COVER_TOO_LARGE", 413);

  const dir = path.join(UPLOAD_ROOT, userId);
  await mkdir(dir, { recursive: true });
  await removeExistingCover(dir, bookId);

  const filename = `${bookId}${COVER_EXTENSION[file.type]}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/covers/${userId}/${filename}`;
}
