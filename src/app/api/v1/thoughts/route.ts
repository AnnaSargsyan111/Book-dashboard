import { parseInput, route } from "@/server/http/route";
import { createThought, listThoughts } from "@/server/modules/thoughts/thought.repository";
import { thoughtSchema } from "@/shared/validation/thought";

/** The signed-in user's own thoughts, newest first. */
export const GET = route({ auth: true }, async (ctx) => {
  const thoughts = await listThoughts(ctx.user!.id);
  return { status: 200, body: { thoughts } };
});

/** Captures a new thought. */
export const POST = route({ auth: true }, async (ctx) => {
  const input = parseInput(thoughtSchema, await ctx.body());
  const thought = await createThought(ctx.user!.id, input);
  return { status: 201, body: { thought } };
});
