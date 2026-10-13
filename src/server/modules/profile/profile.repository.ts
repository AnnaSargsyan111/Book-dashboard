import { getDb } from "@/server/db/client";
import type { GenreKey } from "@/shared/genres";

/**
 * Everything that touches the UserProfile table lives here. It started as onboarding's own repository; it now
 * also backs the About Me page (and, later, the Mystery Book recommendation engine) — one place, one shape.
 */
export interface UserProfileData {
  genres: GenreKey[];
  favoriteAuthors: string[];
  aboutMe: string;
}

function toProfileData(row: { genres: unknown; favoriteAuthors: unknown; aboutMe: string }): UserProfileData {
  return { genres: row.genres as GenreKey[], favoriteAuthors: row.favoriteAuthors as string[], aboutMe: row.aboutMe };
}

/** Read access for later features (About Me, Mystery Book signals). */
export async function findProfile(userId: string): Promise<UserProfileData | null> {
  const row = await getDb().userProfile.findUnique({ where: { userId } });
  return row ? toProfileData(row) : null;
}

/**
 * Replaces the editable profile fields (the About Me page: genres, favorite authors, and the free-text About Me,
 * each independently clearable to empty). The row always exists once onboarding has completed, since it is
 * created in the same transaction that flips `onboardingCompleted`.
 */
export async function updateProfile(userId: string, data: UserProfileData): Promise<UserProfileData> {
  const row = await getDb().userProfile.update({
    where: { userId },
    data: { genres: data.genres, favoriteAuthors: data.favoriteAuthors, aboutMe: data.aboutMe },
  });
  return toProfileData(row);
}
