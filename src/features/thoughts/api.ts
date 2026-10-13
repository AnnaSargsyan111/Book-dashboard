import { apiRequest } from "@/lib/api/client";
import { API, thoughtApi } from "@/shared/routes";
import type { ThoughtDTO, ThoughtInput } from "@/shared/validation/thought";

export const thoughtsApi = {
  list: () => apiRequest<{ thoughts: ThoughtDTO[] }>("GET", API.thoughts),
  create: (input: ThoughtInput) => apiRequest<{ thought: ThoughtDTO }>("POST", API.thoughts, input),
  update: (id: string, input: ThoughtInput) => apiRequest<{ thought: ThoughtDTO }>("PATCH", thoughtApi.detail(id), input),
  remove: (id: string) => apiRequest<void>("DELETE", thoughtApi.detail(id)),
};
