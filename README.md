# MystBook

A private, searchable digital reading notebook: notes, characters, favorite passages and thoughts, kept together.

This repository currently contains the **foundation**: project structure, localization (English + Armenian), the
authentication system (register, log in, log out, forgot / reset password), the mandatory-onboarding gate, the
one-time entrance into the library (page-turn transition + Welcome Modal), the Dashboard shell (navigation, header,
account menu, a distinct warm background per section), the About Me page (the onboarding profile, now editable),
Settings (Account Details, Change Password), Books (adding a book with an optional Claude-powered autofill, a
library grid, a Book Detail page with a cover photo and delete), and Mystery Book — a guided flow that ends in one
personalized recommendation, not a browsable list. Thoughts is next.

## Run it

```bash
npm install
cp .env.example .env        # already present after setup; edit if needed
npm run db:migrate          # creates prisma/dev.db and generates the Prisma client
npm run dev -- --port 3100  # http://localhost:3100
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Vitest: validation, hashing, and the full API (uses its own throw-away `prisma/test.db`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:deploy` | Apply existing migrations (CI / production) |
| `npm run db:studio` | Browse the database |

In development, emails (password reset) are printed to the server console. Set `RESEND_API_KEY` and `EMAIL_FROM` to
deliver them for real.

## Architecture

**One Next.js 16 app (App Router), strictly layered.** The browser never touches the database; everything goes
through a versioned REST API under `/api/v1`, which is thin route files over services.

```
src/
  app/                      Routes only. (auth)/register|login|forgot-password|reset-password, onboarding, books, books/new, books/[id], api/v1/*
  features/auth/            Browser-side auth: forms, API client calls, the shared form hook
  features/onboarding/      The "Tell us about yourself" form and the book-opening entrance transition
  features/books/           Add Book, Book Detail, the library grid's delete icon, the Welcome Modal, the browser-side books API client
  ui/                       Reusable, feature-agnostic components (Button, TextField, PasswordField, ...)
  shared/                   Code used by BOTH browser and server: validation schemas, password rules, routes, API error codes
  i18n/                     Locale config, request resolution, server action that persists the language
  server/                   Server-only code
    config/                 env validation, auth policy (lifetimes, rate limits)
    db/                     the one place a database connection is created
    http/                   `route()` factory: CSRF, session, JSON body, localization, error envelope
    security/               Argon2id hashing, token hashing, DB-backed rate limiting, origin check
    mail/                   console provider (dev) / Resend provider (prod)
    modules/auth/           repository -> services -> guards (the auth domain)
  lib/api/                  Browser fetch wrapper
messages/                   en.json, hy.json (the only place user-facing text lives)
prisma/                     schema + migrations
tests/                      unit + API tests
```

Adding a domain later (books, notes) means adding `server/modules/<domain>`, `app/api/v1/<domain>` and
`features/<domain>` next to the auth ones. Nothing in auth needs restructuring.

### Key decisions

| Concern | Decision |
|---|---|
| Database | SQLite via Prisma 7 for local development. The schema is portable to PostgreSQL: change the datasource provider, swap the adapter in `src/server/db/client.ts`, set `DATABASE_URL`, create a fresh migration baseline. |
| Passwords | Argon2id (`@node-rs/argon2`, OWASP minimum cost), NFKC-normalized. Never stored or logged in plain text. |
| Sessions | Random 256-bit token in an `HttpOnly`, `SameSite=Lax` cookie (`__Host-` + `Secure` in production). Only the SHA-256 **hash** is stored, so a database leak yields no usable sessions. Every request checks the database, so sign-out and password reset revoke immediately. 7-day sliding expiry. |
| Validation | One Zod schema per form, in `src/shared`, used by the browser *and* the API. Schemas emit **translation keys**, never text. The API re-validates everything and rejects unknown fields. |
| Localization | `next-intl`. English default; the choice is stored in the `NEXT_LOCALE` cookie (1 year) and read on the server, so the first paint is already in the right language. Adding a language = one JSON file + one line in `src/i18n/config.ts`. |
| Errors | `{ error: { code, message, fields? } }` with `message` (and each field message) localized on the server; the browser also localizes from `code`, so switching language mid-form re-words everything. 500s never expose details. |
| Abuse control | DB-backed sliding-window rate limits (register per IP, login failures per email+IP and per IP, forgot-password per email and IP, reset attempts per IP), Origin/CSRF check, JSON-only bodies, 100 KB body cap. |
| Privacy | Duplicate email and forgot-password answers are neutral; login gives one identical answer for "no such account" and "wrong password" (and spends equal time). |

### Validation → translation

```
Zod rule  ->  key ("validation.latinOnly")  ->  active language  ->  "Use Latin letters" / "Լրացրեք լատինատառ"
```

### API (`/api/v1/auth`)

| Route | Body | Result |
|---|---|---|
| `POST /register` | `{firstName,lastName,email,password}` | `201 {user}` + session cookie. `409 EMAIL_TAKEN`, `400 VALIDATION_ERROR` (+ `fields`), `429 RATE_LIMITED` |
| `POST /login` | `{email,password}` | `200 {user}` + cookie. `401 INVALID_CREDENTIALS`, `429` |
| `POST /logout` | – | `204`, cookie cleared, session revoked (idempotent) |
| `POST /forgot-password` | `{email}` | always `202 {message}`; email sent after the response |
| `POST /reset-password` | `{token,newPassword}` | `200 {ok:true}`; token is single-use, 60 min, and all sessions are revoked. `400 TOKEN_INVALID_OR_EXPIRED` |
| `GET /session` | – | `200 {user}` or `401` |

`user` = `{ id, firstName, lastName, email, onboardingCompleted, welcomeModalSeen }`.

### API (`/api/v1/onboarding`, `/api/v1/me`, `/api/v1/profile`, `/api/v1/auth`)

| Route | Body | Result |
|---|---|---|
| `POST /onboarding` (signed in) | `{genres: string[≤5], favoriteAuthors: string[≤20], aboutMe: string}` | `200 {user}` with `onboardingCompleted: true`. `400 VALIDATION_ERROR` (+ `fields`), `409 ONBOARDING_ALREADY_COMPLETED`, `401` |
| `POST /me/welcome-seen` (signed in) | – | `200 {user}` with `welcomeModalSeen: true`. Idempotent. `401` |
| `POST /profile` (signed in, onboarded) | `{genres: string[≤5], favoriteAuthors: string[≤20], aboutMe: string}` | `200 {profile}`. Unlike onboarding, **every field may be empty** — this is a profile page, not a second onboarding. `403` if onboarding isn't finished yet. |
| `POST /me/account` (signed in) | `{firstName, lastName}` | `200 {user}`. Email is never accepted (unknown fields rejected). |
| `POST /auth/change-password` (signed in) | `{newPassword, confirmPassword}` | `200 {ok:true}`. No `currentPassword` field — see "Settings" below. Revokes every OTHER session; the caller's own stays valid. `400` (mismatch, or the new password fails the shared policy), `429` after 10/hour. |

### API (`/api/v1/books`)

| Route | Body | Result |
|---|---|---|
| `GET /books` (signed in) | – | `200 {books}`, the caller's own books, newest first. |
| `POST /books` (signed in) | `{title, author, status, rating, genres, plot, characters, quotes, commentary}` | `201 {book}`. `400 VALIDATION_ERROR` (+ `fields`). |
| `POST /books/ai-fill` (signed in) | `{title, author?}` | `200 {author, genres, characters, plot}` (`characters` is always `[]`; the rest `null`/`[]` if unknown). `404 AI_NO_MATCH` (Google Books has no record of the title), `400` (no title). |
| `PATCH /books/:id` (signed in, owner) | same shape as `POST /books` | `200 {book}`. Full replace — Book Detail has no separate edit mode. `404` for a missing book and someone else's book alike. |
| `DELETE /books/:id` (signed in, owner) | – | `204`. Also removes a locally-uploaded cover file, if any. `404` if it doesn't exist or isn't the caller's. |
| `POST /books/:id/cover` (signed in, owner) | multipart `file` (jpeg/png/webp, ≤5 MB) | `200 {book}` with `coverUrl` set. "Add Photo". `415 COVER_INVALID_TYPE`, `413 COVER_TOO_LARGE`, `404`. |
| `POST /books/:id/cover-lookup` (signed in, owner) | – | `200 {book}` with `coverUrl` set to a Google Books cover, if one was found. "Find Cover". `404 COVER_NOT_FOUND` (no match, or Google Books itself errored/rate-limited). |

Rules: **Title, Author and Status are the only required fields.** Status is one of `want_to_read` / `currently_reading`
/ `read` / `did_not_finish` (a plain string — SQLite has no native enum). **Rating** (1–5, 0.5 steps) is required
when Status is `read` and rejected otherwise — the client only ever sends one in that case, but the server enforces
it too, since the star widget itself stays visible-but-inactive for the other three statuses rather than sending
stale state. Genre is free tags (the 22-genre catalog shown as quick picks, or any custom "Other" text — both are
stored the same way, as plain strings), Characters is a flat name list, Quotes is `{text, page?}[]` (`quoteTextMax`
is a 5000-character server safety net, not a visible UI cap). Nothing but Title/Author/Status is required.

Rules: **About Me is the only required field at onboarding** (1–1500 characters, any script, line breaks kept); on
the About Me *page* it becomes optional too, since it must be fully clearable. Genres are optional keys from
`src/shared/genres.ts` (max 5). Favorite Authors are optional free text in any script (max 20, each up to 80 characters,
trimmed, duplicates ignored ignoring case). First/last name are **not** asked or accepted by onboarding or the profile
route (unknown fields are rejected) — only `/me/account` (Settings) ever changes them. The onboarding profile row and
the `onboardingCompleted` flag are written in one transaction, and the flag is claimed conditionally, so completing
twice (or concurrently) can never overwrite the first answers.

### API (`/api/v1/mystery`)

| Route | Body | Result |
|---|---|---|
| `POST /mystery/recommend` (signed in, onboarded) | `{moods, genres?, experience?, revealMode}` | `200 {pickId, revealMode, book, reasoning}`. `book.title`/`author`/`coverUrl` are `null` for `revealMode: "keep_mystery"`. `400 VALIDATION_ERROR`, `403` (onboarding not finished), `503 NO_MYSTERY_AVAILABLE` (nothing left after filtering — never a substitute). Persists a `MysteryPick` immediately. |
| `POST /mystery/recommend/preview` (signed in, onboarded) | `{moods, genres?, experience?, excludeSlugs?}` | `200 {bookSlug, book, reasoning}`. Show Me Now candidate browsing only — computes a real candidate but **never persists**; `excludeSlugs` is this round's own already-seen candidates. Same `400`/`403`/`503` as above. |
| `POST /mystery/recommend/commit` (signed in, onboarded) | `{moods, genres?, experience?, bookSlug}` | `200 {pickId, revealMode, book, reasoning}`. Finalizes one previewed candidate — the only point it's written to the database. Re-validates `bookSlug`'s eligibility (not re-ranked) before persisting; `503 NO_MYSTERY_AVAILABLE` if it's no longer eligible. |
| `POST /mystery/pick/:id/address` (signed in, owner) | `{fullName, addressLine1, addressLine2?, city, region?, postalCode, country, phone?}` | `200 {ok:true}`. `400 VALIDATION_ERROR`, `404` if the pick doesn't exist or isn't the caller's. |
| `POST /mystery/pick/:id/order` (signed in, owner) | `{paymentMethod: "card"\|"cash_on_delivery", acknowledgeNonReturnable: true}` | `200 {ok:true}`. `400 VALIDATION_ERROR` (bad body, or no address on file yet), `404`, `409 BOOK_OUT_OF_STOCK` if the picked book's own `available` flag went false since the recommendation (re-checked here, not trusted from earlier). MVP: no payment gateway, no real charge. |
| `POST /mystery/pick/:id/feedback` (signed in, owner) | `{rating: "loved"\|"okay"\|"not_for_me", tags?}` | `200 {ok:true}`. `400 VALIDATION_ERROR`, `404`. Reachable right from the confirmation screen (there's no real delivery yet to gate it on); not yet fed back into the recommendation engine's scoring. |

Rules: `moods` is 1–2 of the 8 mood keys; `genres` is 1–3 of the catalog's own 12-key list (omitted entirely means
Step 2 was skipped by the cold-start check — the engine falls back to the user's own onboarding genres for that
signal instead); `experience` is at most one of 6 keys; `revealMode` is `"keep_mystery"` or `"show_now"`, always
required. A `MysteryPick` row is written the moment the engine picks a book — not only once the visitor confirms —
so an abandoned session still keeps that title out of their future candidate pools.

### Data model

`User` (id, firstName, lastName, email **unique**, passwordHash, onboardingCompleted=false, welcomeModalSeen=false,
createdAt, updatedAt) · `UserProfile` (userId, genres[keys], favoriteAuthors[], aboutMe; feeds the Mystery Book engine,
and is now also the About Me page's own read/write store — `src/server/modules/profile/`) · `Book` (userId, title,
author, status, rating, genres[], plot, characters[], quotes[], commentary, coverUrl — `src/server/modules/books/`) ·
`MysteryPick` (userId, bookSlug — references the static catalog, not a table — revealMode, moods[], genres[]?,
experience?, the delivery-address fields, paymentMethod + orderedAt (Payment step, MVP), feedbackRating +
feedbackTags (Post-Delivery Feedback), all null until their own step completes — `src/server/modules/mystery/`) ·
`Session` (tokenHash, expiresAt) · `PasswordResetToken` (tokenHash, expiresAt, usedAt) · `RateLimitEvent`.
Email is stored trimmed and lower-cased; the unique index is the final duplicate guard, on top of the application check.
`coverUrl` is null until a cover is set, and holds either a local `/uploads/covers/...` path or an external https URL.

## Flow

```
Register -> account created + signed in -> /onboarding (mandatory while onboardingCompleted=false) -> /books
Login    -> same destination logic (or a safe ?next= path)

Onboarding "Continue" (success)
        -> book-opening transition (client-side, ~1.5s; BookOpeningTransition.tsx)
        -> /books, rendered normally
        -> welcomeModalSeen === false? -> Welcome Modal on top of it (WelcomeModal.tsx)
                                           dismissed (X / Escape / backdrop / the CTA) -> POST /api/v1/me/welcome-seen
                                           -> never shown again, on any device
```

Onboarding ("Tell us about yourself") is mandatory and shown once: after registration, and after any login where it is not
yet completed. Continue saves the answers, plays the book-opening transition, and opens `/books`; from then on
`/onboarding` redirects there. `welcomeModalSeen` is a separate flag from `onboardingCompleted` — completing onboarding
does not set it — so the Welcome Modal's one-time appearance survives independently of onboarding's own state and of
any client-side storage. `/books` is the main landing page (signed in **and** onboarded; `requireOnboardedUser()`
guards it and every page that belongs to the app proper): the premium empty state for a new user, or a first-pass
library grid once books exist. Its "+ Add Your First Book" CTA (and the same CTA in the Welcome Modal) leads to
`/books/new`, the real Add Book form.

## The app shell (`AppFrame`)

Every signed-in page (Books and the four sections below) shares one header via `src/ui/AppFrame.tsx`: the logo, the
five sections, language, and the account menu. It takes the signed-in user as a prop (for the avatar's initials) —
every page that renders it has already called `requireOnboardedUser()`, so this is just passing along what the page
fetched anyway.

**The five sections** (`src/ui/nav/nav-items.ts`, one shared list so the desktop and mobile navs can't drift apart):
About Me (`/about-me`), Books (`/books`), Mystery Book (`/mystery-book`), Thoughts (`/thoughts`), Settings
(`/settings`) — all five have real content.

**About Me** (`src/features/profile/`) is the onboarding answers, made editable: Genre, Favorite Authors and About
Me itself, each independently clearable to nothing, with a dirty-tracked Save Changes button (disabled with nothing
changed, a brief success flash, the error kept on-screen with the edits intact if a save fails). **Settings**
(`src/features/settings/`) is the account-level counterpart — Account Details (First/Last Name, editable; Email,
fixed) uses the identical dirty-tracked Save pattern, and Security holds Change Password (a modal: New Password
with the live checklist + Confirm Password with a live "don't match" message, no Current Password field — see the
note below) and Sign Out. Both pages share one reusable primitive worth knowing about: `src/ui/toast/ToastProvider.tsx`
(mounted once, app-wide, in `Providers.tsx`) — `useToast().show(message)` pops a top-right confirmation for ~3s,
dismissible early, used by both Save flows and by Change Password.

**No Current Password on Change Password** is an explicit, deliberate choice carried over from Finova's own
Settings, not an oversight: any authenticated session for the account may change the password unilaterally, and a
successful change revokes every *other* session while keeping the one that made the change signed in. This trades
a little defense-in-depth for a simpler flow; worth revisiting if this ever handles something more sensitive than a
reading journal.

**Books** (`src/features/books/`, `/books` and `/books/new`): `AddBookForm.tsx` is Title/Author/Status (required) plus
Rating (`StarRating.tsx`, a tappable half-star widget, 1–5 in 0.5 steps — always visible, only active and required
when Status is "Read"), Genre (the shared 22-genre catalog as toggleable quick-pick pills, feeding the same free-tag
chip input a custom "Other" entry would use — one mechanism, not two), Characters (a flat chip list), Quotes
(`QuotesEditor.tsx`, a repeatable "+ Add Quote" list — open text area, no visible character cap, plus an optional
page number), and Commentary. **"Auto-fill"** (formerly "Fill with AI") looks the Title (and Author, if already
typed) up on Google Books' public API (`src/server/ai/book-lookup.ts` — the same real internet lookup "Find
Cover" already uses, see `cover-lookup.ts`) and only ever fills in fields that are still *empty* — it never
overwrites anything already typed. A title Google Books has no record of surfaces as a calm inline message
(`AI_NO_MATCH`), not an error page, and nothing is ever invented for it. Characters is the one field it can never
fill, since no free structured source offers a cast list. Works with no configuration against Google's shared
keyless quota; an optional `GOOGLE_BOOKS_API_KEY` (free, see `.env.example`) gets a private quota instead — the
keyless one is small and shared with every other anonymous caller, so it can run dry.

**The Books dashboard** (`BookGrid.tsx`, `CoverImage.tsx`) is cover-forward, in the spirit of a premium book
platform (visual inspiration only — a Dribbble reference, not copied literally, and re-themed in MystBook's own
warm paper/ink language rather than that reference's dark purple palette): a two-column grid on phones widening to
four on large screens, each card a large 2:3 cover with the status badge, star rating (only when read), title and
author beneath it, and a quick-delete circle floating over the cover's own corner — `bg-surface/85` with a blur, so
it reads regardless of what's under it. A book with no cover gets `CoverImage`'s bookplate placeholder — a warm
gradient, an inset frame line, and the title's own first letter in the display face — deliberately designed, never
a broken-image icon. Cards lift gently and their cover zooms a touch on hover (desktop only); each card links to
`/books/[id]`.

**Book Detail** (`/books/[id]`, `BookDetailForm.tsx`) is every Add Book field again, editable in place — no separate
edit mode, just a dirty-tracked Save Changes button (same pattern as About Me and Settings' Account form: disabled
until something actually changes, a brief success flash, errors keep the edit on screen). On large screens it's a
two-column layout: a sticky cover rail on the left (the same `CoverImage`, larger) with **Add Photo** / **Find
Cover** beneath it, and every field in a wider right column — the Title field itself set in the display serif at a
larger size, since it's effectively the page's own heading. **Add Photo** uploads a file straight to local disk
(`src/server/files/cover-storage.ts`, `public/uploads/covers/<userId>/<bookId>.<ext>` — a deliberate dev-scale
choice, since this project has no cloud object storage set up yet) and **Find Cover** looks the book up by its own
title/author on Open Library's free public API (`src/server/ai/cover-lookup.ts` — a real internet lookup, not an
AI-generated image; no key and no billing account needed, unlike Google Books, which this used to call). A book it
can't find just surfaces as a calm "couldn't find a cover" message. Neither ever overwrites a cover you set the
other way. **Delete**
(`DeleteBookButton.tsx`) is shared between the card's quick-delete icon and Book Detail's own button at the true
bottom of the page — both confirm first (`ui/ConfirmDialog.tsx`) since it's not undoable, and deleting also removes
a locally-uploaded cover file, if there was one.

**Mystery Book** (`/mystery-book`, `src/features/mystery/`) is a guided flow, not a browsable list of AI
suggestions: it ends in exactly one personalized pick. A hand-rolled state machine (`MysteryBookFlow.tsx`) walks
through Mood (required, 1–2 of 8, chips disable once 2 are picked) → Genre (skipped entirely when the **cold-start
check** — `needsGenreStep()`, computed server-side in the page from the user's own profile genres and rated "read"
books — decides the system already knows enough taste) → Desired Experience (optional, at most one) → Mystery
Level, the exact two Reveal Modes from the entry screen (🎁 Keep It a Mystery / 👀 Show Me Now, required). Every
step's answer stays in state as you move forward or back — going Back to change an earlier answer and returning to
the Mystery Level step relabels its button "Update My Mystery" and re-runs the engine, rather than restarting the
flow. Back is the panel's own first element, top-left, on every step (including the result and Payment screens)
except the dedicated No-Match and Out-of-Stock screens, which have their own explicit actions instead — there is
no separate "Cancel" control; leaving is via Back or the app's own nav.

The engine itself (`src/server/mystery/recommend.ts`) follows Filtering → Ranking → one book: it excludes books
already in the user's own library, already recommended to them before, or flagged unavailable, then scores what's
left with the weighted model given — mood match 40%, genre match 25%, reading-history taste 15%, author preference
10%, book popularity 10% (Desired Experience isn't in that 100%-summed table, so it shapes the dynamic "why this
book" reasoning text instead of the score). **When nothing survives filtering, the engine returns `null` and the
UI shows a real "no match" screen with Change Preferences / Try Again — it never silently substitutes an unrelated
book to avoid an empty state.** For **Keep It a Mystery**, the API response itself never carries the title, author
or cover (`src/app/api/v1/mystery/recommend/route.ts` withholds them server-side); **Show Me Now** reveals in two
stages — a blurred-cover teaser (genre, mood match %, approximate length) the visitor taps through to the real
title, author and cover.

**Show Me Now** also lets the visitor browse up to `LIMITS.mysteryRerollMax` (5) distinct candidates via "Try
Another Book" before committing to one — after the 5th, further clicks cycle back through the same 5 rather than
pulling a new one. **The control only appears once the title is already revealed** — never on the blurred teaser —
and picking it jumps straight to the next candidate's own full reveal (title, author, cover) with no re-blurring
back to a teaser in between; a new session (or "Update My Mystery") still starts every candidate blurred, same as
before. This is a genuinely separate, uncommitted browsing phase: `POST /mystery/recommend/preview` computes and
returns a candidate exactly like `/mystery/recommend` does but **never writes a `MysteryPick` row**, so a book the
visitor sees and passes on stays eligible for a future session — only `POST /mystery/recommend/commit` (fired
once, when the visitor actually proceeds past a candidate) persists the pick, and it re-validates the chosen
`bookSlug` against the same eligibility filters rather than re-running ranking, so it commits exactly the book
being looked at. Keep It a Mystery is unaffected by any of this — it still persists immediately on the very first
`/mystery/recommend` call, as before, and has no "change book" option (there is nothing yet to compare candidates
by while the identity stays hidden).

Sending either result's own CTA moves to a **Delivery Address** step (name, address, city, postal code, country,
phone — required before an order can be placed, prefilled from the most recent address on file so a returning user
is never asked to retype it). Phone is Armenia-only, deliberately: the field shows a fixed, non-editable "+374"
prefix beside it, the box itself only ever holds up to 8 digits (non-digit keystrokes are silently dropped, not
just rejected after the fact), and the two are joined into one `+374XXXXXXXX` value everywhere else — client
state, validation, and the database (`phoneField` in `shared/validation/mystery.ts`).

Next is **Payment** (MVP, online/card only): an order summary first (flat MVP pricing — every pick costs the same,
since the product is the curated surprise, not a specific title — plus a flat delivery fee, a placeholder "3–5
business days" estimate, and the saved delivery address as a read-only "Deliver to" line), then a payment-method
indicator and card-detail fields (card number, cardholder name, expiry, CVV), then a required non-returnable
acknowledgment checkbox — all four gate the "Place Order" button (nothing here is a placeholder "disabled forever"
state; filling every field genuinely enables it). The card fields are properly validated (`mysteryCardSchema` in
`shared/validation/mystery.ts`) even though they're decorative: the card number input strips non-digits and
hard-caps at 16 characters as you type, CVV the same capped at 3; the cardholder name must be Latin letters (reuses
the same `validation.latinOnly` rule as every other name field in the app); the expiry auto-formats to `MM/YY` as
you type and is rejected if the month isn't 01–12 or the date has already passed. **This is not a real payment
integration** — the card fields are decorative only, `PAYMENT_METHODS` in `shared/validation/mystery.ts` allows only
`"card"` now (cash-on-delivery was removed), and the actual `/mystery/pick/:id/order` request still only ever sends
`{paymentMethod: "card", acknowledgeNonReturnable: true}` — no card detail is ever transmitted or stored, and no
charge is ever made (see "Known limits"); it exists so the flow has a real-looking ending. Placing the order
re-checks the picked book's own `available` flag (Section 13.26's **Out-of-Stock** case) and shows a dedicated
"this mystery just disappeared" screen with a one-click retry if it changed, rather than trusting the flag from the
original recommendation.

Clicking "Place Order" doesn't jump straight to the confirmation: a dedicated **placing-order loading state**
(the same `SealedBook` illustration used elsewhere in the flow, given a slow continuous sway via a new
`.animate-book-sway` keyframe — `prefers-reduced-motion` turns it off) shows for at least `PLACING_ORDER_MIN_MS`
(1.5s) even if the request finishes faster, so it never flashes past; a failed request is never held back by that
minimum, it returns to the form immediately. The **confirmation screen** itself shows a reveal-mode-specific
heading (🎁 "Your Mystery is on its way" for Keep It a Mystery, with no title shown; 📚 "Your book is on its way"
plus "{title} — {author}" for Show Me Now), a static three-stage "Preparing → Shipped → Delivered" pipeline with
only "Preparing" highlighted (there is no real fulfillment behind the other two — this previews the journey without
claiming it already happened), and a disabled "Leave review (demo)" button with a tooltip explaining why (review
requires the book to be in the visitor's own library first, which nothing here does automatically yet). The
Post-Delivery Feedback API (`POST /mystery/pick/:id/feedback`, `mysteryFeedbackSchema`) still exists and is still
tested — it's just not wired to a live control right now, pending that library link (see "Known limits").

The catalog the engine picks from (`src/server/mystery/catalog.ts`) is a small, hand-authored set of real titles
with the structured metadata (mood profile, genre, pace, length, popularity, availability) the spec calls for —
deliberately richer than a user's own free-text `Book.genres`. The spec calls this out as needing a real,
team-curated catalog with its own tooling; that tooling doesn't exist, so this file *is* the catalog for now (see
"Known limits").

**Thoughts** (`/thoughts`, `/thoughts/new`, `/thoughts/[id]`, `src/features/thoughts/`) is a quiet personal
journal, not a notes app: short free-text captures (`Thought.text`, no title required — `Thought.title` is
optional) each with an optional link to one of the user's own books (`Thought.bookId`, re-verified against the
caller's own library server-side on every save — a guessed id for someone else's book is silently dropped, never
linked) and a `favorite` flag. `ThoughtEditor.tsx` is shared by both the new-thought and edit-in-place pages — same
"full replace, no separate edit mode" rule as Book Detail — and `ThoughtCard.tsx` renders the collection as small
journal entries (an opening quotation mark, the text itself as the whole visual focus, the linked book and dates
underneath) rather than a table; `ThoughtsCollection.tsx` adds lightweight client-side filtering (All / Recent /
Favorites / With Books) once there are more than a handful. The page's own `PageScene` ("thoughts") reuses the
auth page's ruled-paper lines for the same writing-desk feel.

**Desktop** (`PrimaryNav.tsx`, `≥ 64rem`): a plain text row in the header; the current section gets a thin underline,
others sweep one in on hover. **Narrower than that** doesn't shrink the same row — `MobileNav.tsx` swaps it for a
plain icon button that opens a full-screen menu styled like a book's table of contents (numbered entries, large
serif titles, the language switcher at the bottom); a tap navigates and closes it.

**Account menu** (`AccountMenu.tsx`): the header's avatar is the user's initials in a small bordered circle (an
ex-libris-style monogram, not a photo placeholder). Its dropdown holds exactly one item, "Log out" — the spec's
`SignOutButton` gets a `menuItem` rendering for this — with a short `motion` fade/scale in and out; it closes on an
outside click, Escape, or choosing the item.

**Logout, made to survive the back button:** signing out already revoked the session server-side and every guarded
page re-checks the database on every request, so a stale cookie was never enough to get back in. The one gap was the
browser's own back/forward cache: a signed-out visitor pressing Back could get an instant, still-painted glimpse of
a page from before they signed out, served entirely from the browser without ever asking the server. `Providers.tsx`
now listens for `pageshow` with `event.persisted` and reloads immediately when it fires, which sends that navigation
through the real (server-side) auth check instead of trusting what the cache had lying around. Verified in the
browser: log out, press Back, land on `/login` — not on the cached page.

## Design

"MystBook": a manuscript page on library cloth. On the auth panel a quill (a black feather with a blue-grey sheen, a cream hollow quill and an ink-stained
nib) lifts from the margin and writes a poem by Paruyr Sevak, "To My Son" (1955), word by word (each word is revealed
as the nib passes), the marker then highlights the closing line, the quill writes the margin note ("Your world of
books.") and lies down there. The finished page is held for a few seconds, fades, and is written again, on a loop.
The text lives in the message catalogs under `shell.poem` (lines separated by `\n`, stanzas by a blank line, `mark` =
the phrase to highlight) and `shell.note`, so changing the words never touches code. The choreography lives in
`src/ui/WritingSheet.tsx` (timeline) and `src/ui/Quill.tsx` (the vector drawing, generated from one shaft curve); it
restarts when the language changes and shows the finished page, still, with reduced motion.

The left panel picks its picture from the route (`src/ui/PanelScene.tsx`): **Log in** shows an ordinary open book (curved pages with faint text, stacked page edges, leather cover) with letters,
Latin and Armenian, rising from its pages on a loop (`scenes/LettersScene.tsx`; an earlier version with rays of light was
dropped because it looked artificial); **Forgot password** shows a stack of old books with an open book on top whose
pages turn one after another (`scenes/PagesScene.tsx`); every other screen (register, reset password, onboarding)
shows the quill (onboarding shows pastel books stacking one by one with rotating quotes about reading, `scenes/StackScene.tsx`). All four are original vector art, generated in code from fixed seeds so server and browser render
identically. With reduced motion the book is shown alone, the letters are not drawn, and the pages rest as an open fan.

The library motif continues past onboarding. The **book-opening transition** (`entering the library`) is a closed
cover, drawn in the same library-cloth colors as the auth panel, swinging open (a real 3D `rotateY`, not a fake
page-flip GIF) to reveal a plain cream page underneath, then the whole scene fades — a few seconds, once, between
finishing onboarding and arriving at the library. The **Welcome Modal** keeps the spine-and-page shape in miniature:
a narrow cloth-green strip (with a small marker-yellow ribbon, like a bookmark) beside the message, instead of a
generic centered dialog. The **Books empty state** is one leaning book with a dashed "ghost" slot beside it, in the
same flat pastel palette as the onboarding book stack (`ui/scenes/EmptyShelf.tsx`) — an invitation, not an apology.
"Your world of books" is the one phrase repeated across the margin note, the Welcome Modal and the empty state, so
the three moments read as one idea rather than three separate features. The app shell's own signature is the
**mobile table of contents**: rather than shrinking the desktop nav into a generic dropdown, the five sections become
a full-screen page of large serif titles with the same numbering a printed book's contents page would use.

**Page atmosphere** (`src/ui/PageScene.tsx`): each of the five sections gets its own warm CSS/SVG backdrop — not
photography (this project has none, and sourcing licensed photos for five different subjects isn't something to do
casually) but the same hand-drawn-line, gradient-and-grain language the auth scenes already use, just re-themed
per room: About Me (a soft window-light glow, a shelf edge along the bottom), Books (a fuller shelf, richer — it's
the core section), Mystery Book (a deep espresso ground, an off-centre candle glow, an open book + candle motif —
the one room that goes dark, so its content sits on `bg-surface` panels rather than directly on the backdrop),
Thoughts (the same ruled lines as the auth page, a soft lamp glow, a pen), Settings (almost flat, one whisper of an
architectural arch). All five share one small warm token family (`--scene-*` in `globals.css`, deliberately warmer
than `--paper`'s cool sage-grey) and one fixed-backdrop mechanism (`AppFrame`'s `scene` prop), so they read as
different rooms in the same house rather than five different websites. The line-art motif is dropped below `40rem`
width — the gradient wash carries the mood on its own there — and every scene respects `prefers-reduced-motion`.

The one memorable device is the **highlighter**: it marks that quote, draws in under the focused field, and highlights
each password requirement as it is met.
Typography is Newsreader (display) + Instrument Sans (UI), with Noto Serif/Sans Armenian used for Armenian text.
Light ("paper") and dark ("ink") themes follow the system setting. Motion is short and purposeful and is disabled
under `prefers-reduced-motion`.

## Known limits / next steps

- Rate limiting and sessions live in the database; that is fine at this scale. Behind a proxy, make sure the hosting
  platform sets `X-Forwarded-For` (the IP is used for limits).
- No strict Content-Security-Policy yet (needs nonce wiring); basic security headers are set.
- Email verification is not part of this stage.
- Armenian copy beyond the wording you specified (including the 22 genre names, and the supporting copy for Books,
  the Welcome Modal, About Me, Settings and Add Book) was written by the developer and should be reviewed by a
  native speaker. Two genre names (Short Stories, Graphic Novel) were the developer's own pick to reach the
  specified 22-genre catalog — swap them for others if you'd rather. The `home` namespace (the hub page's
  eyebrow/title/intro) and `thoughts.intro` (the Thoughts open book's left-page copy and closing quote) are the
  same: best-effort developer translations, not reviewed by a native speaker.
- Editing the onboarding profile now happens on the About Me page (`POST /api/v1/profile`); there is deliberately
  still no "update onboarding" endpoint — onboarding itself is a one-time gate, never resubmitted.
- Uploaded covers live on local disk (`public/uploads/`, gitignored), not cloud object storage — fine for local
  development, but would need a real bucket (S3, R2, etc.) before this is deployed anywhere with more than one
  instance or an ephemeral filesystem.
- "Auto-fill" depends on Google Books' public API. Keyless, it shares a small quota with every other anonymous
  caller worldwide — a daily bucket that can and does run dry, independent of this app's own usage. Even with a
  key, Google can still return `backendFailed` for a brand-new project until it links a billing account (no
  charges — Books API usage stays free either way, but some projects need billing attached before Google fully
  routes requests to it). Either failure surfaces as the same friendly "couldn't find it" message, never an error
  page. Set `GOOGLE_BOOKS_API_KEY` (free, see `.env.example`) for a private quota.
- "Find Cover" uses Open Library instead (`src/server/ai/cover-lookup.ts`) specifically to sidestep the above —
  no key, no billing account, ever.
- Thoughts has no search and no tagging/folders beyond the built-in filters (All / Recent / Favorites / With
  Books) — intentionally, per its own spec: a capture tool, not a knowledge-management system.
- Mystery Book's catalog (`src/server/mystery/catalog.ts`) is a small, hand-authored set of ~46 real titles, not
  the team/founder-curated catalog with its own tooling the spec describes as a real prerequisite. There is no
  curation UI; adding, editing or retiring a title means editing that file directly.
- Mystery Book's Payment step is an **MVP placeholder, not a real checkout**: online/card only (cash-on-delivery
  was removed), it shows realistic-looking card-detail fields (card number, cardholder name, expiry, CVV) purely
  for the look of a real checkout — those fields are decorative, live only in client state, and are never
  transmitted or stored; only a fixed `paymentMethod: "card"` plus the acknowledgment reach the server. There is
  no payment-provider integration of any kind and no charge is ever made. Wiring up a real provider (Stripe or
  similar, even in test mode) is a substantial, separate piece of work — a different scale than anything else in
  this codebase. Pricing is flat (`MYSTERY_BOOK_PRICE_AMD` / `DELIVERY_FEE_AMD` in `shared/validation/mystery.ts`)
  rather than per-title, since the catalog has no real per-book pricing data either.
- Mystery Book's delivery status on the confirmation screen shows the full "Preparing → Shipped → Delivered"
  pipeline with only "Preparing" ever highlighted — there is no fulfillment system behind this app, so the other
  two stages are never reached or reported as true, only previewed.
- Mystery Book's "reading-history taste" signal matches a user's own free-text `Book.genres` against the
  catalog's stable genre keys by keyword substring (`GENRE_KEYWORDS` in `recommend.ts`) — an approximation, not
  an exact mapping, since a user's own tags aren't drawn from a controlled vocabulary.
- Mystery Book's Post-Delivery Feedback (`POST /mystery/pick/:id/feedback`, rating + optional tags) is a real,
  tested API, but **has no live UI control right now** — the confirmation screen shows a disabled "Leave review
  (demo)" button instead, with a tooltip explaining that reviewing needs the book to be in the visitor's own
  library first (nothing here adds it there automatically yet). Even once wired up, feedback is **not fed back
  into the recommendation engine's scoring** — the spec's "learning loop" (taste profile updates from feedback,
  down-weighting disliked-similar books) is not built.
- "Auto-fill" never returns Characters — Google Books has no structured cast-list field, and nothing is guessed
  in its place. Tests mock the Google Books response (success and no-match) rather than hitting the real API.
- Change Password has no Current Password check (see "The app shell" above) — a documented, deliberate trade-off
  carried over from Finova, not an oversight, but worth a second look before this holds anything more sensitive.
- The back/forward-cache guard (`Providers.tsx`) reloads on any `pageshow` with `event.persisted`, app-wide. It is
  cheap and correct, but it does mean every bfcache restore — not just a signed-out one — gets a reload; there was
  no simple way to tell "restoring a stale authenticated page" apart from "restoring any other cached page" from the
  client alone.
