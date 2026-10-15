import "server-only";
import { cache } from "react";
import { getBook } from "./book.repository";

/** `getBook` memoized for one server render: a detail page asks for the same book in `generateMetadata` and again
 *  in the page itself, which would otherwise be two identical queries per visit. */
export const getBookForRender = cache(getBook);
