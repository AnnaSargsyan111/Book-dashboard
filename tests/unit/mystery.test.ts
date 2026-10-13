import { describe, expect, it } from "vitest";
import type { BookRecord } from "@/server/modules/books/book.repository";
import type { UserProfileData } from "@/server/modules/profile/profile.repository";
import { CATALOG } from "@/server/mystery/catalog";
import { buildReasoning, needsGenreStep, pickBook } from "@/server/mystery/recommend";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { mysteryAddressSchema, mysteryCardSchema, mysteryFeedbackSchema, mysteryOrderSchema, mysteryRecommendSchema, type MoodKey } from "@/shared/validation/mystery";

const emptyProfile: UserProfileData = { genres: [], favoriteAuthors: [], aboutMe: "" };

function book(overrides: Partial<BookRecord> = {}): BookRecord {
  return {
    id: "b1",
    title: "Some Book",
    author: "Some Author",
    status: "read",
    rating: 4,
    genres: [],
    plot: null,
    characters: [],
    quotes: [],
    commentary: null,
    coverUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("mysteryRecommendSchema", () => {
  const valid = { moods: ["cozy"], revealMode: "show_now" };

  it("accepts the minimal valid session (one mood, a reveal mode, nothing else)", () => {
    expect(mysteryRecommendSchema.safeParse(valid).success).toBe(true);
  });

  it("requires at least one mood", () => {
    const errors = fieldErrorKeys(mysteryRecommendSchema.safeParse({ ...valid, moods: [] }).error!);
    expect(errors.moods).toBe("validation.moodRequired");
  });

  it("rejects more than 2 moods", () => {
    expect(mysteryRecommendSchema.safeParse({ ...valid, moods: ["cozy", "magical", "intense"] }).success).toBe(false);
  });

  it("requires a reveal mode", () => {
    const { revealMode: _omit, ...noMode } = valid;
    const errors = fieldErrorKeys(mysteryRecommendSchema.safeParse(noMode).error!);
    expect(errors.revealMode).toBe("validation.revealModeRequired");
  });

  it("genres, when present, needs at least one and at most 3", () => {
    expect(mysteryRecommendSchema.safeParse({ ...valid, genres: [] }).success).toBe(false);
    expect(mysteryRecommendSchema.safeParse({ ...valid, genres: ["fantasy", "romance", "horror", "adventure"] }).success).toBe(false);
    expect(mysteryRecommendSchema.safeParse({ ...valid, genres: ["fantasy"] }).success).toBe(true);
  });

  it("genres is entirely optional (Step 2 can be skipped by the cold-start check)", () => {
    expect(mysteryRecommendSchema.safeParse(valid).data?.genres).toBeUndefined();
  });

  it("rejects unknown fields", () => {
    expect(mysteryRecommendSchema.safeParse({ ...valid, extra: true }).success).toBe(false);
  });
});

describe("needsGenreStep (Section 3, Cold-Start Principle)", () => {
  it("shows the step for a brand-new user with no signal at all", () => {
    expect(needsGenreStep(emptyProfile, [])).toBe(true);
  });

  it("skips the step once onboarding already gave a genre", () => {
    expect(needsGenreStep({ ...emptyProfile, genres: ["fantasy"] }, [])).toBe(false);
  });

  it("skips the step once there's a meaningful rated reading history, even with no onboarding genres", () => {
    const books = [book({ status: "read", rating: 5 }), book({ status: "read", rating: 4 }), book({ status: "read", rating: 3 })];
    expect(needsGenreStep(emptyProfile, books)).toBe(false);
  });

  it("still shows the step with fewer than 3 rated books and no onboarding genres", () => {
    const books = [book({ status: "read", rating: 5 }), book({ status: "read", rating: 4 })];
    expect(needsGenreStep(emptyProfile, books)).toBe(true);
  });

  it("does not count unrated or unread books toward reading history", () => {
    const books = [book({ status: "want_to_read", rating: null }), book({ status: "read", rating: null }), book({ status: "read", rating: null })];
    expect(needsGenreStep(emptyProfile, books)).toBe(true);
  });
});

describe("pickBook (Sections 9–11, filtering + ranking)", () => {
  it("picks the book whose mood profile matches best", () => {
    const result = pickBook({ moods: ["cozy"], genres: ["fantasy"], revealMode: "show_now" }, { profile: emptyProfile, books: [], previousSlugs: new Set() });
    expect(result?.slug).toBe("legends-and-lattes");
  });

  it("excludes a book already recommended to this user before", () => {
    const result = pickBook(
      { moods: ["cozy"], genres: ["fantasy"], revealMode: "show_now" },
      { profile: emptyProfile, books: [], previousSlugs: new Set(["legends-and-lattes"]) },
    );
    expect(result?.slug).not.toBe("legends-and-lattes");
  });

  it("excludes a book already in the user's own library (by title + author)", () => {
    const result = pickBook(
      { moods: ["cozy"], genres: ["fantasy"], revealMode: "show_now" },
      { profile: emptyProfile, books: [book({ title: "Legends & Lattes", author: "Travis Baldree" })], previousSlugs: new Set() },
    );
    expect(result?.slug).not.toBe("legends-and-lattes");
  });

  it("returns null — never an unrelated substitute — once every candidate has been filtered out", () => {
    const everySlug = new Set(CATALOG.map((b) => b.slug));
    const result = pickBook({ moods: ["intense"], revealMode: "keep_mystery" }, { profile: emptyProfile, books: [], previousSlugs: everySlug });
    expect(result).toBeNull();
  });

  it("a partial exhaustion still finds whatever remains eligible", () => {
    const someSlugs = new Set(CATALOG.slice(0, CATALOG.length - 1).map((b) => b.slug));
    const result = pickBook({ moods: ["intense"], revealMode: "keep_mystery" }, { profile: emptyProfile, books: [], previousSlugs: someSlugs });
    expect(result?.slug).toBe(CATALOG[CATALOG.length - 1]!.slug);
  });

  it("never returns a book flagged unavailable", () => {
    const result = pickBook({ moods: ["cozy"], revealMode: "keep_mystery" }, { profile: emptyProfile, books: [], previousSlugs: new Set() });
    expect(result?.available).toBe(true);
  });

  it("prefers a book that actually matches the chosen mood over one scoring higher only on other signals", () => {
    // "a-little-life" has no `cozy` entry at all (0% mood match) but, with a favorite-author and reading-history
    // boost, out-scores "quiet" (cozy: 0.3) on the old single-pass ranking — exactly the "95%... no wait, 0%
    // mood match" result a real session hit. Every other book is excluded so only these two compete.
    const keep = new Set(["a-little-life", "quiet"]);
    const previousSlugs = new Set(CATALOG.filter((b) => !keep.has(b.slug)).map((b) => b.slug));
    const profile: UserProfileData = { ...emptyProfile, favoriteAuthors: ["Hanya Yanagihara"] };
    const books = [book({ genres: ["Literary Fiction"] }), book({ genres: ["Literary Fiction"] }), book({ genres: ["Literary Fiction"] })];

    const result = pickBook({ moods: ["cozy"], revealMode: "show_now" }, { profile, books, previousSlugs });
    expect(result?.slug).toBe("quiet");
  });
});

describe("buildReasoning", () => {
  it("produces non-empty, language-specific copy from the session's own answers", () => {
    const input = { moods: ["escapist", "magical"] as MoodKey[], revealMode: "keep_mystery" as const };
    const en = buildReasoning("en", input);
    const hy = buildReasoning("hy", input);
    expect(en.length).toBeGreaterThan(0);
    expect(hy.length).toBeGreaterThan(0);
    expect(en).not.toBe(hy);
  });

  it("changes when the experience answer changes, not just the moods", () => {
    const base = { moods: ["cozy"] as MoodKey[], revealMode: "keep_mystery" as const };
    const withoutExperience = buildReasoning("en", base);
    const withExperience = buildReasoning("en", { ...base, experience: "makeMeSmile" as const });
    expect(withExperience).not.toBe(withoutExperience);
  });
});

describe("mysteryOrderSchema (Payment step, MVP)", () => {
  it("accepts a payment method plus the required acknowledgment", () => {
    expect(mysteryOrderSchema.safeParse({ paymentMethod: "card", acknowledgeNonReturnable: true }).success).toBe(true);
  });

  it("requires a payment method", () => {
    const errors = fieldErrorKeys(mysteryOrderSchema.safeParse({ acknowledgeNonReturnable: true }).error!);
    expect(errors.paymentMethod).toBe("validation.paymentMethodRequired");
  });

  it("requires the non-returnable acknowledgment to be true, not just present", () => {
    expect(mysteryOrderSchema.safeParse({ paymentMethod: "card", acknowledgeNonReturnable: false }).success).toBe(false);
    const errors = fieldErrorKeys(mysteryOrderSchema.safeParse({ paymentMethod: "card" }).error!);
    expect(errors.acknowledgeNonReturnable).toBe("validation.nonReturnableAckRequired");
  });
});

describe("mysteryFeedbackSchema (Post-Delivery Feedback)", () => {
  it("accepts a rating alone", () => {
    expect(mysteryFeedbackSchema.safeParse({ rating: "loved" }).success).toBe(true);
  });

  it("accepts optional tags alongside a rating", () => {
    expect(mysteryFeedbackSchema.safeParse({ rating: "okay", tags: ["genre", "mood"] }).success).toBe(true);
  });

  it("requires a rating", () => {
    const errors = fieldErrorKeys(mysteryFeedbackSchema.safeParse({}).error!);
    expect(errors.rating).toBe("validation.feedbackRatingRequired");
  });

  it("rejects an unknown tag", () => {
    expect(mysteryFeedbackSchema.safeParse({ rating: "loved", tags: ["nonsense"] }).success).toBe(false);
  });
});

describe("mysteryCardSchema (Payment step's decorative card fields)", () => {
  // A year comfortably in the future, so this test never goes stale.
  const futureExpiry = `01/${String((new Date().getFullYear() % 100) + 5).padStart(2, "0")}`;
  const valid = { cardNumber: "4111111111111111", cardName: "Anna Sargsyan", cardExpiry: futureExpiry, cardCvv: "123" };

  it("accepts a well-formed card", () => {
    expect(mysteryCardSchema.safeParse(valid).success).toBe(true);
  });

  it("requires exactly 16 digits for the card number", () => {
    expect(mysteryCardSchema.safeParse({ ...valid, cardNumber: "411111111111111" }).success).toBe(false);
    const errors = fieldErrorKeys(mysteryCardSchema.safeParse({ ...valid, cardNumber: "abc" }).error!);
    expect(errors.cardNumber).toBe("validation.cardNumberInvalid");
  });

  it("requires the cardholder name to be Latin letters", () => {
    const errors = fieldErrorKeys(mysteryCardSchema.safeParse({ ...valid, cardName: "Աննա Սարգսյան" }).error!);
    expect(errors.cardName).toBe("validation.latinOnly");
  });

  it("requires a non-empty cardholder name", () => {
    const errors = fieldErrorKeys(mysteryCardSchema.safeParse({ ...valid, cardName: "" }).error!);
    expect(errors.cardName).toBe("validation.required");
  });

  it("requires exactly 3 digits for the CVV", () => {
    expect(mysteryCardSchema.safeParse({ ...valid, cardCvv: "12" }).success).toBe(false);
    expect(mysteryCardSchema.safeParse({ ...valid, cardCvv: "1234" }).success).toBe(false);
  });

  it("requires a real MM/YY expiry", () => {
    const errors = fieldErrorKeys(mysteryCardSchema.safeParse({ ...valid, cardExpiry: "13/30" }).error!);
    expect(errors.cardExpiry).toBe("validation.cardExpiryInvalid");
  });

  it("rejects an expiry date in the past", () => {
    const errors = fieldErrorKeys(mysteryCardSchema.safeParse({ ...valid, cardExpiry: "01/20" }).error!);
    expect(errors.cardExpiry).toBe("validation.cardExpired");
  });
});

describe("mysteryAddressSchema's phone field (Armenia-only, +374 + 8 digits)", () => {
  const validAddress = {
    fullName: "Anna Sargsyan",
    addressLine1: "1 Mesrop Mashtots Ave",
    addressLine2: "",
    city: "Yerevan",
    region: "",
    postalCode: "0001",
    country: "Armenia",
    phone: "+37477123456",
  };

  it("accepts a full +374 number with exactly 8 digits", () => {
    expect(mysteryAddressSchema.safeParse(validAddress).success).toBe(true);
  });

  it("is required — empty is rejected, not silently optional", () => {
    const errors = fieldErrorKeys(mysteryAddressSchema.safeParse({ ...validAddress, phone: "" }).error!);
    expect(errors.phone).toBe("validation.phoneInvalid");
  });

  it("rejects fewer or more than 8 digits", () => {
    expect(mysteryAddressSchema.safeParse({ ...validAddress, phone: "+3747712345" }).success).toBe(false);
    expect(mysteryAddressSchema.safeParse({ ...validAddress, phone: "+3747712345678" }).success).toBe(false);
  });

  it("rejects a number missing the +374 prefix", () => {
    expect(mysteryAddressSchema.safeParse({ ...validAddress, phone: "77123456" }).success).toBe(false);
  });
});
