import "server-only";
import { cache } from "react";
import { getThought } from "./thought.repository";

/** `getThought` memoized for one server render — see `getBookForRender`. */
export const getThoughtForRender = cache(getThought);
