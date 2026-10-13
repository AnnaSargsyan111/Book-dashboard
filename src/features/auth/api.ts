import { apiRequest } from "@/lib/api/client";
import type { PublicUser } from "@/shared/api-errors";
import { API } from "@/shared/routes";
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from "@/shared/validation/auth";

/** The auth API, as the browser sees it. Real network calls only; nothing is stubbed. */
export const authApi = {
  register: (input: RegisterInput) => apiRequest<{ user: PublicUser }>("POST", API.register, input),
  login: (input: LoginInput) => apiRequest<{ user: PublicUser }>("POST", API.login, input),
  logout: () => apiRequest<void>("POST", API.logout, {}),
  forgotPassword: (input: ForgotPasswordInput) => apiRequest<{ message: string }>("POST", API.forgotPassword, input),
  resetPassword: (input: ResetPasswordInput) => apiRequest<{ ok: true }>("POST", API.resetPassword, input),
};
