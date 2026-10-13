import { getDb } from "@/server/db/client";
import type { GenreKey } from "@/shared/genres";

export interface UserProfileData {
  genres: GenreKey[];
  favoriteAuthors: string[];
  aboutMe: string;
}

/** Read access for later features (About Me, Mystery Book signals). */
export async function findProfile(userId: string): Promise<UserProfileData | null> {
  const row = await getDb().userProfile.findUnique({ where: { userId } });
  if (!row) return null;
  return { genres: row.genres as GenreKey[], favoriteAuthors: row.favoriteAuthors as string[], aboutMe: row.aboutMe };
}
