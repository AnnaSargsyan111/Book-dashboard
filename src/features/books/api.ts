import { apiRequest, apiUpload } from "@/lib/api/client";
import type { PublicUser } from "@/shared/api-errors";
import { API, bookApi } from "@/shared/routes";
import type { BookAiFillInput, BookAiFillResult, BookDTO, BookInput, BookReorderInput } from "@/shared/validation/book";

export const booksApi = {
  /** Marks the one-time Welcome Modal as seen. Fire-and-forget from the caller's point of view: the modal closes
   *  immediately in the UI regardless of the network result, since this state is not worth blocking on. */
  markWelcomeSeen: () => apiRequest<{ user: PublicUser }>("POST", API.welcomeSeen, {}),
  list: () => apiRequest<{ books: BookDTO[] }>("GET", API.books),
  create: (input: BookInput) => apiRequest<{ book: BookDTO }>("POST", API.books, input),
  aiFill: (input: BookAiFillInput) => apiRequest<BookAiFillResult>("POST", API.bookAiFill, input),
  update: (id: string, input: BookInput) => apiRequest<{ book: BookDTO }>("PATCH", bookApi.detail(id), input),
  remove: (id: string) => apiRequest<void>("DELETE", bookApi.detail(id)),
  uploadCover: (id: string, file: File) => {
    const form = new FormData();
    form.set("file", file);
    return apiUpload<{ book: BookDTO }>(bookApi.cover(id), form);
  },
  findCover: (id: string) => apiRequest<{ book: BookDTO }>("POST", bookApi.coverLookup(id), {}),
  reorder: (id: string, input: BookReorderInput) => apiRequest<{ moved: boolean }>("POST", bookApi.reorder(id), input),
};
