import { getDb } from "@/server/db/client";
import type { ExperienceKey, MoodKey, MysteryAddressInput, MysteryFeedbackInput, MysteryRecommendInput, PaymentMethod, SavedAddress } from "@/shared/validation/mystery";

/** One row backing Mystery Book → "Recently Recommended" — see `MysteryRecommendationView`'s own schema comment
 *  for why this is a separate table from `MysteryPick`. */
export interface RecommendationViewRow {
  id: string;
  bookSlug: string;
  moods: MoodKey[];
  experience: ExperienceKey | null;
  createdAt: Date;
  /** The library book this recommendation became via "+ Add", if any. */
  libraryBookId: string | null;
}

/** Records that a "Show Me Now" candidate was actually shown to the user — called from both
 *  `/mystery/recommend/preview` (every candidate fetched, including ones later passed over via "Try Another
 *  Book") and `/mystery/recommend/commit` (defense-in-depth; normally a no-op, since commit only ever finalizes
 *  a slug that was already previewed first). A no-op if this exact user+book was already recorded — the reroll
 *  cap's wrap-around never calls this a second time anyway (see the model's own doc comment), but the unique
 *  constraint is a second guard regardless, which is also Section 9's own "can't be added twice" requirement. */
export async function recordRecommendationView(userId: string, bookSlug: string, moods: MoodKey[], experience: ExperienceKey | undefined): Promise<void> {
  await getDb().mysteryRecommendationView.upsert({
    where: { userId_bookSlug: { userId, bookSlug } },
    update: {},
    create: { userId, bookSlug, moods, experience: experience ?? null },
  });
}

/** Newest first. */
export async function listRecommendationViews(userId: string, limit = 24): Promise<RecommendationViewRow[]> {
  const rows = await getDb().mysteryRecommendationView.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, bookSlug: true, moods: true, experience: true, createdAt: true, libraryBook: { select: { id: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    bookSlug: r.bookSlug,
    moods: r.moods as MoodKey[],
    experience: r.experience as ExperienceKey | null,
    createdAt: r.createdAt,
    libraryBookId: r.libraryBook?.id ?? null,
  }));
}

/** Ownership-scoped lookup for "+ Add" (`POST /mystery/recommendation-view/:id/add-to-library`) — never resolves
 *  someone else's recommendation, even by a guessed id. */
export async function findRecommendationView(userId: string, id: string) {
  return getDb().mysteryRecommendationView.findFirst({ where: { id, userId } });
}

/** Removes one "Recently Recommended" card — display-only, same as the row it deletes: it doesn't touch
 *  `MysteryPick`, so a book removed from this list stays just as excluded from future recommendations as it was
 *  before (Section 11's exclusion reads `MysteryPick`, never this table). A library entry already made from it
 *  via "+ Add" isn't deleted either — `Book.sourceMysteryViewId` is `onDelete: SetNull`, so it simply loses the
 *  backlink. Ownership-scoped the same way `findRecommendationView` is; a no-op (not an error) for an id that's
 *  someone else's or already gone. */
export async function deleteRecommendationView(userId: string, id: string): Promise<boolean> {
  const { count } = await getDb().mysteryRecommendationView.deleteMany({ where: { id, userId } });
  return count > 0;
}

/** Every slug ever recommended to this user — Section 11's "previously-recommended Mystery Book" filter. */
export async function listPickedSlugs(userId: string): Promise<Set<string>> {
  const rows = await getDb().mysteryPick.findMany({ where: { userId }, select: { bookSlug: true } });
  return new Set(rows.map((r) => r.bookSlug));
}

/** Recorded the moment the engine picks a book — not only once the user confirms — so a session someone
 *  abandons before the final CTA still keeps that title out of their future candidate pools. Returns the row's
 *  own id, which the address step (a later, separate request) needs to know which pick to attach to. */
export async function createPick(userId: string, bookSlug: string, input: MysteryRecommendInput): Promise<string> {
  const row = await getDb().mysteryPick.create({
    data: {
      userId,
      bookSlug,
      revealMode: input.revealMode,
      moods: input.moods,
      genres: input.genres ?? undefined,
      experience: input.experience ?? null,
    },
    select: { id: true },
  });
  return row.id;
}

/** Attaches a delivery address to an existing pick — ownership-scoped, so a guessed id from another user's
 *  session can never be written to. Returns false if the pick doesn't exist or isn't this user's. */
export async function saveAddress(userId: string, pickId: string, address: MysteryAddressInput): Promise<boolean> {
  const { count } = await getDb().mysteryPick.updateMany({ where: { id: pickId, userId }, data: address });
  return count > 0;
}

/** The most recently saved address on file, if any, so a returning user is never asked to retype it. */
export async function findLastAddress(userId: string): Promise<SavedAddress> {
  const row = await getDb().mysteryPick.findFirst({
    where: { userId, addressLine1: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { fullName: true, addressLine1: true, addressLine2: true, city: true, region: true, postalCode: true, country: true, phone: true },
  });
  if (!row || !row.fullName || !row.addressLine1 || !row.city || !row.postalCode || !row.country) return null;
  return {
    fullName: row.fullName,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2 ?? "",
    city: row.city,
    region: row.region ?? "",
    postalCode: row.postalCode,
    country: row.country,
    // Stored (and here returned) as the full "+374XXXXXXXX" — the address form's own input displays just the 8
    // local digits, stripping the fixed "+374" prefix back off for the box, but the field's real value everywhere
    // else (state, schema, API, database) is always the complete number.
    phone: row.phone ?? "",
  };
}

/** Ownership-scoped lookup for the order and feedback steps, which both need to read the pick (its book slug
 *  for the Out-of-Stock re-check, or its address to require one exists) before writing to it. */
export async function findPick(userId: string, pickId: string) {
  return getDb().mysteryPick.findFirst({ where: { id: pickId, userId } });
}

/** Records a placed order (Payment step, MVP — no real gateway, nothing here moves money). Assumes the caller
 *  already re-checked the book's availability (Out-of-Stock, Section 13.26) and that an address is on file. */
export async function markOrdered(pickId: string, paymentMethod: PaymentMethod): Promise<void> {
  await getDb().mysteryPick.update({ where: { id: pickId }, data: { paymentMethod, orderedAt: new Date() } });
}

/** Post-Delivery Feedback — the learning-loop input (not yet fed back into scoring, see README). Ownership-scoped
 *  like `saveAddress`; returns false if the pick doesn't exist or isn't this user's. */
export async function saveFeedback(userId: string, pickId: string, input: MysteryFeedbackInput): Promise<boolean> {
  const { count } = await getDb().mysteryPick.updateMany({
    where: { id: pickId, userId },
    data: { feedbackRating: input.rating, feedbackTags: input.tags ?? undefined },
  });
  return count > 0;
}
