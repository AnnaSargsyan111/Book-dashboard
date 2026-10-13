import { apiRequest } from "@/lib/api/client";
import { API, mysteryPickApi, mysteryViewApi } from "@/shared/routes";
import type { BookDTO, BookInput } from "@/shared/validation/book";
import type {
  MysteryAddressInput,
  MysteryCommitInput,
  MysteryFeedbackInput,
  MysteryOrderInput,
  MysteryPreviewInput,
  MysteryPreviewResult,
  MysteryRecentRecommendation,
  MysteryRecommendInput,
  MysteryRecommendResult,
} from "@/shared/validation/mystery";

export const mysteryApi = {
  recommend: (input: MysteryRecommendInput) => apiRequest<MysteryRecommendResult>("POST", API.mysteryRecommend, input),
  preview: (input: MysteryPreviewInput) => apiRequest<MysteryPreviewResult>("POST", API.mysteryPreview, input),
  commit: (input: MysteryCommitInput) => apiRequest<MysteryRecommendResult>("POST", API.mysteryCommit, input),
  saveAddress: (pickId: string, input: MysteryAddressInput) => apiRequest<{ ok: true }>("POST", mysteryPickApi.address(pickId), input),
  placeOrder: (pickId: string, input: MysteryOrderInput) => apiRequest<{ ok: true }>("POST", mysteryPickApi.order(pickId), input),
  submitFeedback: (pickId: string, input: MysteryFeedbackInput) => apiRequest<{ ok: true }>("POST", mysteryPickApi.feedback(pickId), input),
  recent: () => apiRequest<{ recommendations: MysteryRecentRecommendation[] }>("GET", API.mysteryRecent),
  addToLibrary: (viewId: string, input: BookInput) => apiRequest<{ book: BookDTO }>("POST", mysteryViewApi.addToLibrary(viewId), input),
  removeRecommendation: (viewId: string) => apiRequest<void>("DELETE", mysteryViewApi.detail(viewId)),
};
