"use client";

import { ArrowLeft, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ApiRequestError, isApiRequestError } from "@/lib/api/client";
import { useTranslateKey } from "@/lib/forms/useTranslateKey";
import { fieldErrorKeys } from "@/shared/validation/auth";
import { LIMITS } from "@/shared/validation/limits";
import {
  DELIVERY_FEE_AMD,
  EXPERIENCE_KEYS,
  MOOD_KEYS,
  MYSTERY_BOOK_PRICE_AMD,
  MYSTERY_GENRE_KEYS,
  mysteryAddressSchema,
  mysteryCardSchema,
  type ExperienceKey,
  type MoodKey,
  type MysteryAddressInput,
  type MysteryGenreKey,
  type MysteryPreviewResult,
  type MysteryRecommendResult,
  type RevealMode,
  type SavedAddress,
} from "@/shared/validation/mystery";
import { Button } from "@/ui/Button";
import { CoverImage } from "@/ui/CoverImage";
import { FormAlert } from "@/ui/FormAlert";
import { TextField } from "@/ui/TextField";
import { SealedBook } from "@/ui/scenes/SealedBook";
import { mysteryApi } from "./api";
import { Chip } from "./Chip";

const MOOD_EMOJI: Record<MoodKey, string> = {
  magical: "✨",
  cozy: "🌿",
  escapist: "🌙",
  emotional: "❤️",
  intense: "🔥",
  lightFun: "☀️",
  thoughtProvoking: "🧠",
  mysterious: "🕯️",
};

const REVEAL_EMOJI: Record<RevealMode, string> = { keep_mystery: "🎁", show_now: "👀" };

const EMPTY_ADDRESS: MysteryAddressInput = { fullName: "", addressLine1: "", addressLine2: "", city: "", region: "", postalCode: "", country: "", phone: "" };

/** Placing the order always shows its own loading state for at least this long, so a fast response doesn't just
 *  flash past — see `handlePlaceOrder`. */
const PLACING_ORDER_MIN_MS = 1500;

/** Same idea as `PLACING_ORDER_MIN_MS`, for the Reveal step's own loading state — see `runRecommend`. */
const RECOMMEND_MIN_MS = 1200;

type Stage =
  | "entry"
  | "mood"
  | "genre"
  | "experience"
  | "reveal"
  | "loading"
  | "result"
  | "no-match"
  | "address"
  | "payment"
  | "placing-order"
  | "out-of-stock"
  | "confirmed";
type AddressField = keyof MysteryAddressInput;

/** Whatever step the user last reached (plus the data that step needs to render), kept in `sessionStorage` so
 *  that leaving for another page and coming back resumes right there instead of snapping back to "entry" — only
 *  the flow's own action buttons (Back, Start Over, Find Another Mystery) are allowed to move it. Deliberately
 *  excludes the payment fields (never worth persisting, even for a cosmetic demo form) and the busy/error states
 *  (those are transient by nature and should always start clean on a fresh mount). Session-scoped rather than
 *  `localStorage` since this is a single ephemeral checkout-style session, not something meant to outlive the tab. */
type PersistedFlowState = {
  stage: Stage;
  moods: MoodKey[];
  genres: MysteryGenreKey[];
  experience: ExperienceKey | null;
  revealMode: RevealMode | null;
  result: MysteryRecommendResult | null;
  teaserRevealed: boolean;
  previewCandidates: MysteryPreviewResult[];
  candidateIndex: number;
  address: MysteryAddressInput;
  addressEditing: boolean;
  nonReturnableAck: boolean;
};

const FLOW_STORAGE_KEY = "mysteryBookFlowState";

function loadPersistedFlow(): PersistedFlowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(FLOW_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedFlowState) : null;
  } catch {
    return null;
  }
}

/** MVP pricing display only — see the shared constants' own doc comment for why the price is flat. */
function formatAmd(amount: number): string {
  return `${amount.toLocaleString("en-US")} ֏`;
}

/** A single-choice card: reveal mode and Step 3's experience share this, styled as a real `radiogroup`. */
function ChoiceCard({ checked, onClick, icon, label, description }: { checked: boolean; onClick: () => void; icon?: ReactNode; label: string; description?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-colors ${
        checked ? "border-ink bg-surface" : "border-rule-strong hover:border-ink"
      }`}
    >
      {icon ? <span className="text-2xl">{icon}</span> : null}
      <span className="font-display text-[1.0625rem] leading-snug">{label}</span>
      {description ? <span className="text-sm leading-relaxed text-muted">{description}</span> : null}
    </button>
  );
}

function StepShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="animate-rise mx-auto max-w-2xl">
      <h1 className="text-balance font-display text-[clamp(1.5rem,1.25rem+0.9vw,2.125rem)] leading-[1.1] tracking-[-0.01em]">{title}</h1>
      {subtitle ? <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-muted">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
      <div className="mt-5 flex flex-wrap items-center gap-4">{footer}</div>
    </div>
  );
}

/**
 * The whole Mystery Book session: entry -> Mood -> Genre (only when `needsGenreStep`) -> Experience -> Reveal
 * mode -> the recommendation engine runs -> a result screen (branch depends on the reveal mode, or a real
 * "no match" screen if the engine found nothing) -> a delivery-address step -> confirmed. A hand-rolled state
 * machine rather than the shared form hook — this isn't one schema's worth of fields, it's a multi-step wizard
 * with a server-computed step in the middle and a conditional step besides.
 *
 * Every stage's own state (moods, genres, experience, reveal mode, the generated result) lives here and is
 * never cleared by navigating — going Back and changing an earlier answer, then forward again, re-generates
 * ("Update My Mystery") rather than restarting the whole flow.
 */
export function MysteryBookFlow({
  needsGenreStep,
  initialAddress,
  landingContent,
  onEntryChange,
}: {
  needsGenreStep: boolean;
  initialAddress: SavedAddress;
  /** The premium page-level hero (Mystery Book page redesign, Sections 2–4) — when given, it replaces this
   *  component's own plain "entry" screen one-for-one rather than stacking above it (the hero already has its
   *  own "Mystery Book" heading, copy and "Find My Mystery" CTA, so showing both back to back would just repeat
   *  the same screen twice). Receives `start`, the exact transition the built-in entry screen's own button
   *  already used — calling it is the only thing the hero needs to do to launch Step 1. Every other stage,
   *  every question, and all scoring/navigation logic is untouched either way; a persisted mid-flow session
   *  (see the hydration effect below) resumes past "entry" entirely, so the hero is never shown over it. */
  landingContent?: (start: () => void) => ReactNode;
  /** Fires whenever `stage` changes, with whether it's now "entry" — lets a sibling outside this component (see
   *  `MysteryBookPageClient`) show "Recently Recommended" only alongside the landing hero and hide it for every
   *  other step, without lifting `stage` itself (private to this component) anywhere. */
  onEntryChange?: (isEntry: boolean) => void;
}) {
  const t = useTranslations("mysteryBook");
  const tf = useTranslations("mysteryBook.addressStep.fields");
  const tk = useTranslateKey();

  const [stage, setStage] = useState<Stage>("entry");
  const [moods, setMoods] = useState<MoodKey[]>([]);
  const [moodError, setMoodError] = useState(false);
  const [genres, setGenres] = useState<MysteryGenreKey[]>([]);
  const [genreError, setGenreError] = useState(false);
  const [experience, setExperience] = useState<ExperienceKey | null>(null);
  const [revealMode, setRevealMode] = useState<RevealMode | null>(null);
  const [revealError, setRevealError] = useState(false);
  const [result, setResult] = useState<MysteryRecommendResult | null>(null);
  const [teaserRevealed, setTeaserRevealed] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // "Show Me Now" candidate browsing (change book up to LIMITS.mysteryRerollMax times, then wrap back to the
  // first one) — uncommitted; nothing here is written to the database until `handleCommitShowNow`. `result`
  // stays null throughout browsing and is only ever set for this mode once a candidate is actually committed.
  const [previewCandidates, setPreviewCandidates] = useState<MysteryPreviewResult[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [commitBusy, setCommitBusy] = useState(false);
  const [commitError, setCommitError] = useState<ApiRequestError | null>(null);
  const currentCandidate = previewCandidates[candidateIndex] ?? null;

  const [address, setAddress] = useState<MysteryAddressInput>(initialAddress ?? EMPTY_ADDRESS);
  const [addressTouched, setAddressTouched] = useState<Partial<Record<AddressField, boolean>>>({});
  const [addressBusy, setAddressBusy] = useState(false);
  const [addressError, setAddressError] = useState<ApiRequestError | null>(null);
  // A returning user with an address on file sees it as a summary first (Continue / Edit), not the full form
  // again — editing reveals the same form below, pre-filled from that same saved address.
  const [addressEditing, setAddressEditing] = useState(initialAddress === null);

  const [nonReturnableAck, setNonReturnableAck] = useState(false);
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderError, setOrderError] = useState<ApiRequestError | null>(null);
  // Cosmetic only — this is an MVP checkout with no real gateway, so these never leave the browser; the API call
  // still only ever sends `{paymentMethod: "card", acknowledgeNonReturnable}`. Validated client-side (mysteryCardSchema)
  // so the step doesn't feel like a no-op form: digits-only/fixed-length card number and CVV, Latin-only
  // cardholder name, a real unexpired MM/YY.
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardTouched, setCardTouched] = useState<Partial<Record<"cardNumber" | "cardName" | "cardExpiry" | "cardCvv", boolean>>>({});


  // Hydrating from `sessionStorage` has to wait until after the first client render (never during the render
  // that has to match the server's HTML) — reading it any earlier causes a hydration mismatch, since the server
  // always renders "entry". `hydrated` gates the persist-effect below so it doesn't fire (and overwrite the
  // just-restored data with the page's initial defaults) before this restore has actually landed.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const persisted = loadPersistedFlow();
    if (persisted) {
      // A session saved while the (now removed) in-flow review step was open resumes on the confirmation instead.
      setStage((persisted.stage as string) === "review" ? "confirmed" : persisted.stage);
      setMoods(persisted.moods);
      setGenres(persisted.genres);
      setExperience(persisted.experience);
      setRevealMode(persisted.revealMode);
      setResult(persisted.result);
      setTeaserRevealed(persisted.teaserRevealed);
      setPreviewCandidates(persisted.previewCandidates);
      setCandidateIndex(persisted.candidateIndex);
      setAddress(persisted.address);
      setAddressEditing(persisted.addressEditing);
      setNonReturnableAck(persisted.nonReturnableAck);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const snapshot: PersistedFlowState = {
      stage,
      moods,
      genres,
      experience,
      revealMode,
      result,
      teaserRevealed,
      previewCandidates,
      candidateIndex,
      address,
      addressEditing,
      nonReturnableAck,
    };
    try {
      sessionStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // sessionStorage can throw (private browsing, quota) — resuming mid-flow is a convenience, not essential.
    }
  }, [
    stage,
    moods,
    genres,
    experience,
    revealMode,
    result,
    teaserRevealed,
    previewCandidates,
    candidateIndex,
    address,
    addressEditing,
    nonReturnableAck,
    hydrated,
  ]);

  // Every step opens at the top of the page: a long step (address, payment) scrolled down must not carry that scroll
  // position into the next, shorter one. The first run (initial mount / restore from sessionStorage) is left alone.
  const stepKey = `${stage}|${teaserRevealed}|${candidateIndex}|${addressEditing}`;
  const lastStepKey = useRef(stepKey);
  useEffect(() => {
    if (lastStepKey.current === stepKey) return;
    lastStepKey.current = stepKey;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [stepKey]);

  useEffect(() => {
    onEntryChange?.(stage === "entry");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function toggleMood(key: MoodKey) {
    setMoodError(false);
    setMoods((prev) => (prev.includes(key) ? prev.filter((m) => m !== key) : prev.length < LIMITS.moodsMax ? [...prev, key] : prev));
  }
  function toggleGenre(key: MysteryGenreKey) {
    setGenreError(false);
    setGenres((prev) => (prev.includes(key) ? prev.filter((g) => g !== key) : prev.length < LIMITS.mysteryGenresMax ? [...prev, key] : prev));
  }

  function handleMoodContinue() {
    if (moods.length === 0) {
      setMoodError(true);
      return;
    }
    setStage(needsGenreStep ? "genre" : "experience");
  }
  function handleGenreContinue() {
    if (genres.length === 0) {
      setGenreError(true);
      return;
    }
    setStage("experience");
  }
  function handleGenreSkip() {
    setGenres([]);
    setStage("experience");
  }

  async function runRecommend() {
    setStage("loading");
    setApiError(null);
    setNonReturnableAck(false);
    setOrderError(null);
    setResult(null);
    setPreviewCandidates([]);
    setCandidateIndex(0);
    setTeaserRevealed(false);
    setPreviewError(null);
    setCommitError(null);
    const startedAt = Date.now();
    try {
      if (revealMode === "show_now") {
        const candidate = await mysteryApi.preview({ moods, genres: genres.length > 0 ? genres : undefined, experience: experience ?? undefined });
        setPreviewCandidates([candidate]);
      } else {
        const res = await mysteryApi.recommend({ moods, genres: genres.length > 0 ? genres : undefined, experience: experience ?? undefined, revealMode: "keep_mystery" });
        setResult(res);
      }
      // A minimum visible duration so the loading moment always reads as an active search, not an instant
      // flash — but only on success; a failed request goes back to the reveal step immediately.
      const remaining = RECOMMEND_MIN_MS - (Date.now() - startedAt);
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      setStage("result");
    } catch (e) {
      if (isApiRequestError(e) && e.code === "NO_MYSTERY_AVAILABLE") {
        setStage("no-match");
        return;
      }
      setStage("reveal");
      if (isApiRequestError(e)) setApiError(tk(e.messageKey) ?? null);
      else throw e;
    }
  }

  /** "Try Another Book" — only ever reachable after the title is already revealed (see the render below): picks
   *  up to `LIMITS.mysteryRerollMax` real candidates, fetched via the preview endpoint (never persisted), and
   *  goes straight to the next one's full reveal — no re-blurring back to a teaser. Once that many have been
   *  shown, further clicks just cycle back through the same set rather than asking the server for a new one — the
   *  book you passed on stays eligible for a future session either way. */
  async function handleTryAnother() {
    if (previewBusy) return;
    if (previewCandidates.length >= LIMITS.mysteryRerollMax) {
      setCandidateIndex((i) => (i + 1) % previewCandidates.length);
      return;
    }
    setPreviewBusy(true);
    setPreviewError(null);
    try {
      const excludeSlugs = previewCandidates.map((c) => c.bookSlug);
      const candidate = await mysteryApi.preview({ moods, genres: genres.length > 0 ? genres : undefined, experience: experience ?? undefined, excludeSlugs });
      const newIndex = previewCandidates.length;
      setPreviewCandidates((prev) => [...prev, candidate]);
      setCandidateIndex(newIndex);
    } catch (e) {
      if (isApiRequestError(e) && e.code === "NO_MYSTERY_AVAILABLE") {
        // The catalog has nothing left to offer beyond what's already been shown this round — wrap back to what
        // we have rather than dead-ending, or fall through to the real no-match screen if we have nothing at all.
        if (previewCandidates.length > 0) {
          setCandidateIndex(0);
        } else {
          setStage("no-match");
        }
        return;
      }
      if (isApiRequestError(e)) setPreviewError(tk(e.messageKey) ?? null);
      else throw e;
    } finally {
      setPreviewBusy(false);
    }
  }

  /** Finalizes the currently-viewed "Show Me Now" candidate — the only point such a pick is actually written to
   *  the database (see mysteryCommitSchema's own doc comment). */
  async function handleCommitShowNow() {
    if (commitBusy || !currentCandidate) return;
    setCommitBusy(true);
    setCommitError(null);
    try {
      const res = await mysteryApi.commit({ moods, genres: genres.length > 0 ? genres : undefined, experience: experience ?? undefined, bookSlug: currentCandidate.bookSlug });
      setResult(res);
      setStage("address");
    } catch (e) {
      if (isApiRequestError(e) && e.code === "NO_MYSTERY_AVAILABLE") {
        setStage("out-of-stock");
        return;
      }
      if (isApiRequestError(e)) setCommitError(e);
      else throw e;
    } finally {
      setCommitBusy(false);
    }
  }

  function handleRevealContinue() {
    if (!revealMode) {
      setRevealError(true);
      return;
    }
    void runRecommend();
  }

  function handleBack() {
    if (stage === "mood") setStage("entry");
    else if (stage === "genre") setStage("mood");
    else if (stage === "experience") setStage(needsGenreStep ? "genre" : "mood");
    else if (stage === "reveal" || stage === "no-match") setStage("experience");
    else if (stage === "result") setStage("reveal");
    else if (stage === "address") setStage("result");
    else if (stage === "payment") setStage("address");
  }

  function setAddressField(name: AddressField, value: string) {
    setAddress((prev) => ({ ...prev, [name]: value }));
  }

  /** The phone field's own value is always the full "+374XXXXXXXX" (see `phoneField` in shared/validation/mystery)
   *  — "+374" is a fixed prefix shown beside the input, never itself editable, so this rebuilds the full value
   *  from whatever digits the visible box now holds. */
  function setPhoneFiltered(value: string) {
    setAddress((prev) => ({ ...prev, phone: `+374${value.replace(/\D/g, "").slice(0, 8)}` }));
  }

  async function handleAddressSubmit() {
    if (addressBusy || !result) return;
    const parsed = mysteryAddressSchema.safeParse(address);
    if (!parsed.success) {
      setAddressTouched({ fullName: true, addressLine1: true, city: true, postalCode: true, country: true, phone: true });
      return;
    }
    setAddressBusy(true);
    setAddressError(null);
    try {
      await mysteryApi.saveAddress(result.pickId, parsed.data);
      setAddressEditing(false);
      setStage("payment");
    } catch (e) {
      if (isApiRequestError(e)) setAddressError(e);
      else throw e;
    } finally {
      setAddressBusy(false);
    }
  }

  function setCardNumberFiltered(value: string) {
    setCardNumber(value.replace(/\D/g, "").slice(0, 16));
  }
  function setCardCvvFiltered(value: string) {
    setCardCvv(value.replace(/\D/g, "").slice(0, 3));
  }
  function setCardExpiryFiltered(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  }

  const cardParseResult = mysteryCardSchema.safeParse({ cardNumber, cardName, cardExpiry, cardCvv });
  const cardSchemaErrors = cardParseResult.success ? {} : fieldErrorKeys(cardParseResult.error);
  const cardErrorFor = (name: "cardNumber" | "cardName" | "cardExpiry" | "cardCvv") => (cardTouched[name] ? tk(cardSchemaErrors[name]) : undefined);
  const canPlaceOrder = nonReturnableAck;

  async function handlePlaceOrder() {
    if (orderBusy || !result || !canPlaceOrder) return;
    if (!cardParseResult.success) {
      setCardTouched({ cardNumber: true, cardName: true, cardExpiry: true, cardCvv: true });
      return;
    }
    setOrderBusy(true);
    setOrderError(null);
    setStage("placing-order");
    const startedAt = Date.now();
    try {
      await mysteryApi.placeOrder(result.pickId, { paymentMethod: "card", acknowledgeNonReturnable: true });
      // A minimum visible duration so the loading state never feels like an abrupt flash — but only on success;
      // a failed request goes back to the form immediately, never artificially delayed.
      const remaining = PLACING_ORDER_MIN_MS - (Date.now() - startedAt);
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      setStage("confirmed");
    } catch (e) {
      if (isApiRequestError(e) && e.code === "BOOK_OUT_OF_STOCK") {
        setStage("out-of-stock");
        return;
      }
      setStage("payment");
      if (isApiRequestError(e)) setOrderError(e);
      else throw e;
    } finally {
      setOrderBusy(false);
    }
  }

  /** "Find another Mystery" (the feedback-submitted screen's own CTA) — a full reset back to Mystery Book's very
   *  first screen, not just a Back one stage up: every answer, pick and in-progress form field from this session
   *  is cleared so the next visit starts clean, the same as a first-time visitor would see it. */
  function handleStartOver() {
    setStage("entry");
    setMoods([]);
    setMoodError(false);
    setGenres([]);
    setGenreError(false);
    setExperience(null);
    setRevealMode(null);
    setRevealError(false);
    setResult(null);
    setTeaserRevealed(false);
    setApiError(null);
    setPreviewCandidates([]);
    setCandidateIndex(0);
    setPreviewBusy(false);
    setPreviewError(null);
    setCommitBusy(false);
    setCommitError(null);
    setAddressBusy(false);
    setAddressError(null);
    setNonReturnableAck(false);
    setOrderBusy(false);
    setOrderError(null);
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setCardTouched({});
  }

  const hasResult = result !== null || previewCandidates.length > 0;
  const addressParseResult = mysteryAddressSchema.safeParse(address);
  const addressSchemaErrors = addressParseResult.success ? {} : fieldErrorKeys(addressParseResult.error);
  const addressErrorFor = (name: AddressField) => (addressTouched[name] ? tk(addressSchemaErrors[name]) : undefined);

  const showBack =
    stage !== "entry" &&
    stage !== "loading" &&
    stage !== "placing-order" &&
    stage !== "confirmed" &&
    stage !== "no-match" &&
    stage !== "out-of-stock";
  const topRow = showBack ? (
    <button
      type="button"
      onClick={handleBack}
      className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-rule-strong px-3.5 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t("back")}
    </button>
  ) : null;

  // The premium page-level hero (when supplied) stands entirely on its own — full width, its own photographic
  // background — rather than inside the flow's padded "surface" card below, which every other stage (including
  // the plain fallback entry screen, when no hero is supplied) keeps exactly as it already was.
  if (stage === "entry" && landingContent) {
    return <div>{landingContent(() => setStage("mood"))}</div>;
  }

  return (
    <div>
      {/* Mystery Book's own scene goes dark (candlelight, Section "Visual Direction") — the whole flow sits on a
       *  light surface panel here for the same reason the login page's manuscript sheet sits on library cloth:
       *  --ink text has no reliable contrast against that backdrop otherwise. Back/Cancel are the panel's own
       *  first thing, top-left, not floating above it — that's where people actually look for them. */}
      <div className="animate-rise rounded-[2rem] sm:-my-12 border border-rule-strong bg-surface p-5 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.35)] sm:p-7">
      {topRow}
      {stage === "entry" && (
        <div className="animate-rise mx-auto flex max-w-[26rem] flex-col items-center py-4 text-center">
          <SealedBook />
          <h1 className="mt-5 max-w-[18ch] text-balance font-display text-[clamp(2rem,1.5rem+2vw,3rem)] leading-[1.1] tracking-[-0.01em]">{t("entry.title")}</h1>
          <p className="mt-4 max-w-[36ch] text-[1.0625rem] leading-relaxed text-muted">{t("entry.subtitle")}</p>
          <Button className="mt-5" onClick={() => setStage("mood")}>
            {t("entry.cta")}
          </Button>
        </div>
      )}

      {stage === "mood" && (
        <StepShell
          title={t("moodStep.title")}
          subtitle={t("moodStep.subtitle")}
          footer={
            <Button onClick={handleMoodContinue}>
              {t("moodStep.cta")}
            </Button>
          }
        >
          {moodError ? (
            <p role="alert" className="mb-4 text-[0.9375rem] text-danger">
              {t("moodStep.validation")}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2.5">
            {MOOD_KEYS.map((key) => (
              <Chip
                key={key}
                active={moods.includes(key)}
                disabled={!moods.includes(key) && moods.length >= LIMITS.moodsMax}
                onClick={() => toggleMood(key)}
                title={t(`moodHints.${key}`)}
              >
                {MOOD_EMOJI[key]} {t(`moods.${key}`)}
              </Chip>
            ))}
          </div>
        </StepShell>
      )}

      {stage === "genre" && (
        <StepShell
          title={t("genreStep.title")}
          subtitle={t("genreStep.subtitle")}
          footer={
            <>
              <Button onClick={handleGenreContinue}>
                {t("genreStep.cta")}
              </Button>
              <button type="button" onClick={handleGenreSkip} className="text-[0.9375rem] font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                {t("genreStep.skip")}
              </button>
            </>
          }
        >
          {genreError ? (
            <p role="alert" className="mb-4 text-[0.9375rem] text-danger">
              {t("genreStep.validation")}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2.5">
            {MYSTERY_GENRE_KEYS.map((key) => (
              <Chip key={key} active={genres.includes(key)} disabled={!genres.includes(key) && genres.length >= LIMITS.mysteryGenresMax} onClick={() => toggleGenre(key)}>
                {t(`genres.${key}`)}
              </Chip>
            ))}
          </div>
        </StepShell>
      )}

      {stage === "experience" && (
        <StepShell
          title={t("experienceStep.title")}
          subtitle={t("experienceStep.subtitle")}
          footer={
            <>
              <Button onClick={() => setStage("reveal")}>
                {t("experienceStep.cta")}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setExperience(null);
                  setStage("reveal");
                }}
                className="text-[0.9375rem] font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline"
              >
                {t("experienceStep.skip")}
              </button>
            </>
          }
        >
          <div role="radiogroup" aria-label={t("experienceStep.title")} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCE_KEYS.map((key) => (
              <ChoiceCard
                key={key}
                checked={experience === key}
                onClick={() => setExperience((prev) => (prev === key ? null : key))}
                label={t(`experiences.${key}`)}
                description={t(`experienceDescriptions.${key}`)}
              />
            ))}
          </div>
        </StepShell>
      )}

      {stage === "reveal" && (
        <StepShell
          title={t("revealStep.title")}
          footer={
            <Button onClick={handleRevealContinue}>
              {hasResult ? t("revealStep.updateCta") : t("revealStep.cta")}
            </Button>
          }
        >
          <FormAlert>{apiError}</FormAlert>
          {revealError ? (
            <p role="alert" className="mb-4 mt-3 text-[0.9375rem] text-danger">
              {t("revealStep.validation")}
            </p>
          ) : null}
          <div role="radiogroup" aria-label={t("revealStep.title")} className="grid gap-4 sm:grid-cols-2">
            {(["keep_mystery", "show_now"] as const).map((mode) => (
              <ChoiceCard
                key={mode}
                checked={revealMode === mode}
                onClick={() => {
                  setRevealError(false);
                  setRevealMode(mode);
                }}
                icon={REVEAL_EMOJI[mode]}
                label={t(`revealModes.${mode === "keep_mystery" ? "keepMystery" : "showNow"}.label`)}
                description={t(`revealModes.${mode === "keep_mystery" ? "keepMystery" : "showNow"}.description`)}
              />
            ))}
          </div>
        </StepShell>
      )}

      {stage === "loading" && (
        <div className="animate-rise mx-auto flex max-w-[26rem] flex-col items-center py-10 text-center">
          <div className="animate-book-sway">
            <SealedBook />
          </div>
          <p className="mt-6 text-[1.0625rem] text-muted">{t("loading")}</p>
        </div>
      )}

      {stage === "no-match" && (
        <div className="animate-rise mx-auto max-w-[30rem] text-center">
          <h1 className="max-w-[22ch] text-balance font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-[1.15] tracking-[-0.01em]">{t("noMatch.heading")}</h1>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{t("noMatch.subheading")}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <Button onClick={() => setStage("mood")}>
              {t("noMatch.changePreferences")}
            </Button>
            <button type="button" onClick={() => void runRecommend()} className="text-[0.9375rem] font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline">
              {t("noMatch.tryAgain")}
            </button>
          </div>
        </div>
      )}

      {stage === "result" && result && result.revealMode === "keep_mystery" && (
        <div className="animate-rise mx-auto max-w-3xl text-center lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-center lg:gap-10 lg:text-left">
          <SealedBook />
          <div>
            <h1 className="mx-auto mt-5 text-balance font-display text-[clamp(1.5rem,1.25rem+0.9vw,2.125rem)] leading-[1.1] tracking-[-0.01em] lg:mx-0 lg:mt-0">{t("resultKeepMystery.heading")}</h1>
            <p className="mx-auto mt-3 max-w-[46ch] text-base leading-relaxed text-muted lg:mx-0">{t("resultKeepMystery.subheading")}</p>

            <div className="mx-auto mt-5 max-w-[30rem] rounded-2xl border border-rule-strong bg-surface p-5 text-left lg:mx-0">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">{t("resultKeepMystery.matchLabel")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {moods.map((m) => (
                  <span key={m} className="rounded-full border border-rule px-3 py-1 text-sm text-ink-2">
                    {MOOD_EMOJI[m]} {t(`moods.${m}`)}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.1em] text-muted">{t("resultKeepMystery.reasoningLabel")}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{result.reasoning}</p>
            </div>

            <Button className="mt-5" onClick={() => setStage("address")}>
              {t("resultKeepMystery.cta")}
            </Button>
          </div>
        </div>
      )}

      {stage === "result" && revealMode === "show_now" && !result && currentCandidate && !teaserRevealed && (
        <div className="animate-rise mx-auto max-w-2xl text-center">
          <h1 className="mx-auto text-balance font-display text-[clamp(1.5rem,1.25rem+0.9vw,2.125rem)] leading-[1.1] tracking-[-0.01em]">{t("resultShowNow.teaserHeading")}</h1>
          <div className="mt-5 lg:flex lg:items-center lg:gap-10 lg:text-left">
            <div className="mx-auto max-w-[9rem] lg:mx-0 lg:w-[9rem] lg:shrink-0">
              <div className="pointer-events-none blur-md">
                <CoverImage src={null} title="?" alt="" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <dl className="mx-auto mt-4 flex max-w-[26rem] flex-col gap-1.5 text-left lg:mx-0 lg:mt-0">
                <div className="flex items-center justify-between gap-4 border-b border-rule pb-1.5">
                  <dt className="text-sm text-muted">{t("resultShowNow.genreLabel")}</dt>
                  <dd className="font-medium text-ink">{t(`genres.${currentCandidate.book.genre}`)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-rule pb-1.5">
                  <dt className="text-sm text-muted">{t("resultShowNow.moodMatchLabel")}</dt>
                  <dd className="font-medium text-ink">{Math.round(currentCandidate.book.moodMatch * 100)}%</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-rule pb-1.5">
                  <dt className="text-sm text-muted">{t("resultShowNow.lengthLabel")}</dt>
                  <dd className="font-medium text-ink">{t("resultShowNow.pages", { count: currentCandidate.book.approxPages })}</dd>
                </div>
              </dl>
              <FormAlert>{previewError}</FormAlert>
              <Button className="mt-5" onClick={() => setTeaserRevealed(true)}>
                {t("resultShowNow.revealCta")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {stage === "result" && revealMode === "show_now" && !result && currentCandidate && teaserRevealed && (
        <div className="animate-rise mx-auto max-w-3xl text-center lg:grid lg:grid-cols-[9rem_minmax(0,1fr)] lg:items-start lg:gap-10 lg:text-left">
          <div className="mx-auto max-w-[9rem]">
            <CoverImage src={currentCandidate.book.coverUrl} title={currentCandidate.book.title ?? "?"} alt="" />
          </div>
          <div>
            <h1 className="mx-auto mt-4 text-balance font-display text-[clamp(1.5rem,1.25rem+0.9vw,2.125rem)] leading-[1.1] tracking-[-0.01em] lg:mx-0 lg:mt-0">{currentCandidate.book.title}</h1>
            <p className="mt-2 text-[1.0625rem] text-muted">{currentCandidate.book.author}</p>

            <div className="mx-auto mt-4 max-w-[30rem] rounded-2xl border border-rule-strong bg-surface p-5 text-left lg:mx-0">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">{t("resultShowNow.reasoningLabel")}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{currentCandidate.reasoning}</p>
            </div>

            <FormAlert>{commitError ? tk(commitError.messageKey) : previewError}</FormAlert>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Button onClick={() => void handleCommitShowNow()} state={commitBusy ? "loading" : "idle"}>
                {t("resultShowNow.cta")}
              </Button>
              <button
                type="button"
                onClick={() => void handleTryAnother()}
                disabled={previewBusy || commitBusy}
                className="text-[0.9375rem] font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline disabled:opacity-50"
              >
                {previewBusy ? t("resultShowNow.changing") : t("resultShowNow.changeCta")}
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">{t("resultShowNow.triedCount", { count: previewCandidates.length, max: LIMITS.mysteryRerollMax })}</p>
          </div>
        </div>
      )}

      {stage === "result" && result && result.revealMode === "show_now" && (
        <div className="animate-rise mx-auto max-w-3xl text-center lg:grid lg:grid-cols-[9rem_minmax(0,1fr)] lg:items-start lg:gap-10 lg:text-left">
          <div className="mx-auto max-w-[9rem]">
            <CoverImage src={result.book.coverUrl} title={result.book.title ?? "?"} alt="" />
          </div>
          <div>
            <h1 className="mx-auto mt-4 text-balance font-display text-[clamp(1.5rem,1.25rem+0.9vw,2.125rem)] leading-[1.1] tracking-[-0.01em] lg:mx-0 lg:mt-0">{result.book.title}</h1>
            <p className="mt-2 text-[1.0625rem] text-muted">{result.book.author}</p>

            <div className="mx-auto mt-4 max-w-[30rem] rounded-2xl border border-rule-strong bg-surface p-5 text-left lg:mx-0">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">{t("resultShowNow.reasoningLabel")}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{result.reasoning}</p>
            </div>

            <Button className="mt-5" onClick={() => setStage("address")}>
              {t("resultShowNow.cta")}
            </Button>
          </div>
        </div>
      )}

      {stage === "address" && !addressEditing && (
        <StepShell
          title={t("addressStep.summaryTitle")}
          footer={
            <>
              <Button onClick={handleAddressSubmit} state={addressBusy ? "loading" : "idle"}>
                {t("addressStep.cta")}
              </Button>
              <button
                type="button"
                onClick={() => setAddressEditing(true)}
                className="text-[0.9375rem] font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline"
              >
                {t("addressStep.edit")}
              </button>
            </>
          }
        >
          <FormAlert>{addressError ? tk(addressError.messageKey) : null}</FormAlert>
          <div className="rounded-2xl border border-rule-strong bg-paper p-5 text-[0.9375rem] leading-relaxed">
            <p>{address.fullName}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
            <p>
              {address.city}
              {address.region ? `, ${address.region}` : ""} {address.postalCode}
            </p>
            <p>{address.country}</p>
            <p className="mt-2 text-muted">{address.phone}</p>
          </div>
        </StepShell>
      )}

      {stage === "address" && addressEditing && (
        <StepShell
          title={t("addressStep.title")}
          subtitle={t("addressStep.subtitle")}
          footer={
            <Button onClick={handleAddressSubmit} state={addressBusy ? "loading" : "idle"}>
              {t("addressStep.cta")}
            </Button>
          }
        >
          <FormAlert>{addressError ? tk(addressError.messageKey) : null}</FormAlert>
          {/* Left column reads top-down as who/where (name, country, region, city); right column as the street-level
           *  details (address, apartment, postal code, phone). */}
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <TextField
              label={tf("fullName")}
              value={address.fullName}
              onChange={(e) => setAddressField("fullName", e.target.value)}
              onBlur={() => setAddressTouched((p) => ({ ...p, fullName: false }))}
              error={addressErrorFor("fullName")}
            />
            <TextField
              label={tf("addressLine1")}
              value={address.addressLine1}
              onChange={(e) => setAddressField("addressLine1", e.target.value)}
              onBlur={() => setAddressTouched((p) => ({ ...p, addressLine1: false }))}
              error={addressErrorFor("addressLine1")}
            />
            <TextField
              label={tf("country")}
              value={address.country}
              onChange={(e) => setAddressField("country", e.target.value)}
              onBlur={() => setAddressTouched((p) => ({ ...p, country: false }))}
              error={addressErrorFor("country")}
            />
            <TextField label={tf("addressLine2")} value={address.addressLine2} onChange={(e) => setAddressField("addressLine2", e.target.value)} />
            <TextField label={tf("region")} value={address.region} onChange={(e) => setAddressField("region", e.target.value)} />
            <TextField
              label={tf("postalCode")}
              value={address.postalCode}
              onChange={(e) => setAddressField("postalCode", e.target.value)}
              onBlur={() => setAddressTouched((p) => ({ ...p, postalCode: false }))}
              error={addressErrorFor("postalCode")}
            />
            <TextField
              label={tf("city")}
              value={address.city}
              onChange={(e) => setAddressField("city", e.target.value)}
              onBlur={() => setAddressTouched((p) => ({ ...p, city: false }))}
              error={addressErrorFor("city")}
            />
            <TextField
              label={tf("phone")}
              type="tel"
              inputMode="numeric"
              value={address.phone.replace(/^\+374/, "")}
              onChange={(e) => setPhoneFiltered(e.target.value)}
              onBlur={() => setAddressTouched((p) => ({ ...p, phone: false }))}
              error={addressErrorFor("phone")}
              leading={<span className="pl-4 text-[1rem] text-muted">+374</span>}
            />
          </div>
        </StepShell>
      )}

      {stage === "payment" && result && (
        <StepShell
          title={t("paymentStep.title")}
          footer={
            <Button onClick={handlePlaceOrder} state={orderBusy ? "loading" : "idle"} disabled={!canPlaceOrder}>
              {t("paymentStep.cta")}
            </Button>
          }
        >
          <FormAlert>{orderError ? tk(orderError.messageKey) : null}</FormAlert>

          <div className="rounded-2xl border border-rule-strong bg-paper p-5">
            <p className="font-display text-lg leading-snug">
              {result.revealMode === "show_now" && result.book.title ? result.book.title : t("entry.title")}
            </p>
            <dl className="mt-4 flex flex-col gap-2 text-[0.9375rem]">
              <div className="flex items-center justify-between">
                <dt className="text-muted">{t("paymentStep.price")}</dt>
                <dd>{formatAmd(MYSTERY_BOOK_PRICE_AMD)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">{t("paymentStep.deliveryFee")}</dt>
                <dd>{formatAmd(DELIVERY_FEE_AMD)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">{t("paymentStep.estimatedDelivery")}</dt>
                <dd>{t("paymentStep.estimatedDeliveryValue")}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="shrink-0 text-muted">{t("paymentStep.deliverTo")}</dt>
                <dd className="text-right">{[address.city, address.addressLine1].filter(Boolean).join(", ")}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-rule pt-2 font-medium text-ink">
                <dt>{t("paymentStep.total")}</dt>
                <dd>{formatAmd(MYSTERY_BOOK_PRICE_AMD + DELIVERY_FEE_AMD)}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-5 text-sm font-medium text-ink-2">{t("paymentStep.methodLabel")}</p>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-ink bg-surface px-4 py-3">
            <CreditCard className="size-5 shrink-0 text-ink-2" aria-hidden="true" />
            <div>
              <p className="font-medium text-ink">{t("paymentStep.methods.card")}</p>
              <p className="text-sm text-muted">{t("paymentStep.cardBrands")}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-5">
            <TextField
              label={t("paymentStep.fields.cardNumber")}
              value={cardNumber}
              onChange={(e) => setCardNumberFiltered(e.target.value)}
              onBlur={() => setCardTouched((p) => ({ ...p, cardNumber: false }))}
              error={cardErrorFor("cardNumber")}
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              autoComplete="off"
            />
            <TextField
              label={t("paymentStep.fields.cardholderName")}
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onBlur={() => setCardTouched((p) => ({ ...p, cardName: false }))}
              error={cardErrorFor("cardName")}
              autoComplete="off"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label={t("paymentStep.fields.expiryDate")}
                value={cardExpiry}
                onChange={(e) => setCardExpiryFiltered(e.target.value)}
                onBlur={() => setCardTouched((p) => ({ ...p, cardExpiry: false }))}
                error={cardErrorFor("cardExpiry")}
                placeholder="MM/YY"
                inputMode="numeric"
                autoComplete="off"
              />
              <TextField
                label={t("paymentStep.fields.cvv")}
                value={cardCvv}
                onChange={(e) => setCardCvvFiltered(e.target.value)}
                onBlur={() => setCardTouched((p) => ({ ...p, cardCvv: false }))}
                error={cardErrorFor("cardCvv")}
                placeholder="CVV"
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
          </div>

          <label className="mt-6 flex items-start gap-3 text-[0.9375rem] leading-relaxed text-ink-2">
            <input type="checkbox" checked={nonReturnableAck} onChange={(e) => setNonReturnableAck(e.target.checked)} className="mt-1 size-4 shrink-0 accent-ink" />
            {t("paymentStep.nonReturnableAck")}
          </label>
        </StepShell>
      )}

      {stage === "placing-order" && (
        <div className="animate-rise mx-auto flex max-w-[26rem] flex-col items-center py-10 text-center">
          <div className="animate-book-sway">
            <SealedBook />
          </div>
          <p className="mt-6 text-[1.0625rem] text-muted">{t("placingOrder")}</p>
        </div>
      )}

      {stage === "out-of-stock" && (
        <div className="animate-rise mx-auto max-w-[30rem] text-center">
          <h1 className="max-w-[22ch] text-balance font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-[1.15] tracking-[-0.01em]">{t("outOfStock.heading")}</h1>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{t("outOfStock.subheading")}</p>
          <Button className="mt-5" onClick={() => void runRecommend()}>
            {t("outOfStock.cta")}
          </Button>
        </div>
      )}

      {stage === "confirmed" && result && (
        <div role="status" className="animate-rise mx-auto max-w-[28rem] text-center">
          <h2 className="font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-tight">
            {result.revealMode === "show_now" ? t("confirmed.headingShowNow") : t("confirmed.headingKeepMystery")}
          </h2>
          {result.revealMode === "show_now" && result.book.title ? (
            <p className="mt-2 text-[1.0625rem] text-muted">
              {result.book.title} — {result.book.author}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-rule-strong bg-surface px-6 py-4 text-[0.9375rem] font-medium">
            <span className="text-ok">{t("confirmed.statusPreparing")}</span>
            <span className="text-muted" aria-hidden="true">
              →
            </span>
            <span className="text-muted">{t("confirmed.statusShipped")}</span>
            <span className="text-muted" aria-hidden="true">
              →
            </span>
            <span className="text-muted">{t("confirmed.statusDelivered")}</span>
          </div>

          <Button className="mt-5" onClick={handleStartOver}>
            {t("confirmed.startOver")}
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
