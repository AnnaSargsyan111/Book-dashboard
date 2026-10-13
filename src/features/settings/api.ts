import { apiRequest } from "@/lib/api/client";
import type { PublicUser } from "@/shared/api-errors";
import { API } from "@/shared/routes";
import type { ChangePasswordInput, UpdateAccountInput } from "@/shared/validation/account";

export const settingsApi = {
  updateAccount: (input: UpdateAccountInput) => apiRequest<{ user: PublicUser }>("POST", API.updateAccount, input),
  changePassword: (input: ChangePasswordInput) => apiRequest<{ ok: true }>("POST", API.changePassword, input),
};
