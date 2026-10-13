import { apiRequest } from "@/lib/api/client";
import type { PublicUser } from "@/shared/api-errors";
import { API } from "@/shared/routes";
import type { OnboardingInput } from "@/shared/validation/onboarding";

export const onboardingApi = {
  complete: (input: OnboardingInput) => apiRequest<{ user: PublicUser }>("POST", API.onboarding, input),
};
