import { describe, expect, it } from "vitest";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { LIMITS } from "@/shared/validation/limits";
import { thoughtSchema } from "@/shared/validation/thought";

const valid = { title: "A realization", text: "The paved road isn't the only road.", bookId: null, favorite: false };

function errorsFor(input: unknown) {
  const result = thoughtSchema.safeParse(input);
  return result.success ? {} : fieldErrorKeys(result.error);
}

describe("thought schema (New/Edit Thought)", () => {
  it("accepts a fully filled-in thought", () => {
    expect(thoughtSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a thought with no title — title is never required", () => {
    expect(thoughtSchema.safeParse({ ...valid, title: "" }).success).toBe(true);
  });

  it("requires non-empty text", () => {
    expect(errorsFor({ ...valid, text: "" }).text).toBe("validation.required");
    expect(errorsFor({ ...valid, text: "   " }).text).toBe("validation.required");
  });

  it("accepts a linked bookId or null", () => {
    expect(thoughtSchema.safeParse({ ...valid, bookId: "book-1" }).success).toBe(true);
    expect(thoughtSchema.safeParse({ ...valid, bookId: null }).success).toBe(true);
  });

  it("rejects text over the limit", () => {
    const errors = errorsFor({ ...valid, text: "a".repeat(LIMITS.thoughtTextMax + 1) });
    expect(errors.text).toBe("validation.thoughtTextTooLong");
  });

  it("rejects a title over the limit", () => {
    const errors = errorsFor({ ...valid, title: "a".repeat(LIMITS.thoughtTitleMax + 1) });
    expect(errors.title).toBe("validation.thoughtTitleTooLong");
  });

  it("rejects unknown fields", () => {
    expect(thoughtSchema.safeParse({ ...valid, extra: true }).success).toBe(false);
  });
});
