import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MysteryBookPageClient } from "@/features/mystery/MysteryBookPageClient";
import { requireOnboardedUser } from "@/server/modules/auth/guards";
import { countRatedReads } from "@/server/modules/books/book.repository";
import { findLastAddress } from "@/server/modules/mystery/mystery.repository";
import { findProfile } from "@/server/modules/profile/profile.repository";
import { needsGenreStepFor } from "@/server/mystery/recommend";
import { AppFrame } from "@/ui/AppFrame";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("mysteryBook") };
}

/**
 * A guided flow that ends in one personalized pick, not a browsable list (the earlier "Mood-Based
 * Recommendations" and "Mystery Book" ideas merged into this single flow). The cold-start check (Section 3) runs
 * here, server-side, since it needs the same profile + reading-history signals the recommendation engine itself
 * uses: skip asking Step 2 (Genre) when the system already has enough signal about taste.
 */
export default async function MysteryBookPage() {
  const user = await requireOnboardedUser();
  const [profile, ratedReads, lastAddress] = await Promise.all([findProfile(user.id), countRatedReads(user.id), findLastAddress(user.id)]);

  return (
    <AppFrame user={user} scene="mysteryBook">
      <MysteryBookPageClient needsGenreStep={needsGenreStepFor(profile!, ratedReads)} initialAddress={lastAddress} />
    </AppFrame>
  );
}
