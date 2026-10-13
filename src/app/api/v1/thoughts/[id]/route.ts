import { parseInput, route } from "@/server/http/route";
import { ApiError } from "@/server/http/errors";
import { deleteThought, updateThought } from "@/server/modules/thoughts/thought.repository";
import { thoughtSchema } from "@/shared/validation/thought";

/** Saves every field in place — a thought has no separate edit mode, so this is a full replace of the same
 *  shape POST /api/v1/thoughts accepts. 404 for a missing thought and someone else's alike, so ownership is
 *  never distinguishable from "doesn't exist" by a guessed id. */
export const PATCH = route({ auth: true }, async (ctx) => {
  const input = parseInput(thoughtSchema, await ctx.body());
  const thought = await updateThought(ctx.user!.id, ctx.params.id!, input);
  if (!thought) throw new ApiError("NOT_FOUND", 404);
  return { status: 200, body: { thought } };
});

/** Permanently removes the thought. */
export const DELETE = route({ auth: true }, async (ctx) => {
  const removed = await deleteThought(ctx.user!.id, ctx.params.id!);
  if (!removed) throw new ApiError("NOT_FOUND", 404);
  return { status: 204 };
});
