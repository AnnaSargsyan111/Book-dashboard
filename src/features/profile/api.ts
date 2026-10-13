import { apiRequest } from "@/lib/api/client";
import { API } from "@/shared/routes";
import type { ProfileUpdateInput } from "@/shared/validation/profile";

export const profileApi = {
  update: (input: ProfileUpdateInput) => apiRequest<{ profile: ProfileUpdateInput }>("POST", API.profile, input),
};
