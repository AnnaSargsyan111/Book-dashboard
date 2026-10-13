import { BookOpen, Compass, NotebookPen, Settings as SettingsIcon, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { WelcomeModal } from "@/features/books/WelcomeModal";
import { ROUTES } from "@/shared/routes";
import { BookIntro } from "@/ui/BookIntro";
import { ScrollReveal } from "@/ui/ScrollReveal";
import { Nightingale } from "@/ui/scenes/Nightingale";
import { ChapterCard } from "./ChapterCard";

type ChapterKey = "aboutMe" | "books" | "mysteryBook" | "thoughts" | "settings";

/** Five chapters only, in the same fixed order as the sidebar nav (`NAV_ITEMS`) and the brief that defined this
 *  page: numeral, icon and destination live here (decorative/structural, not content); the real shipped copy for
 *  each section comes in from `copy` below, sourced one level up in `src/app/page.tsx` via `getTranslations`. */
const CHAPTERS: { key: ChapterKey; numeral: string; icon: LucideIcon; href: string }[] = [
  { key: "aboutMe", numeral: "I", icon: UserRound, href: ROUTES.aboutMe },
  { key: "books", numeral: "II", icon: BookOpen, href: ROUTES.books },
  { key: "mysteryBook", numeral: "III", icon: Compass, href: ROUTES.mysteryBook },
  { key: "thoughts", numeral: "IV", icon: NotebookPen, href: ROUTES.thoughts },
  { key: "settings", numeral: "V", icon: SettingsIcon, href: ROUTES.settings },
];

/**
 * The app's own hub page, shown instead of a redirect once a signed-in user is fully onboarded (see
 * `src/app/page.tsx`): a welcome, and a book-themed introduction to the five real sections, each linking straight
 * to its real page. Not the Mystery Book feature page — see that file's own doc comment — this is MystBook's own
 * front matter.
 *
 * The whole page is one physical book now, not a dark photo banner sitting above a lighter card: a single
 * `.book-frame`/`.landing-book-edge` panel (the same visible stacked-page edge every other section's open-book
 * layout uses) carries both the welcome line and the table of contents — except the welcome line sits on the
 * book's actual front cover, not its first page. That top band is `.cloth`, the same dark, woven material
 * `MobileNav`'s takeover and the pre-login auth panel still use, bled to the frame's own top corners; the
 * parchment "Contents" page beneath it is the first page you'd see on opening the cover. `.landing-spine` is the
 * one literal physical cue in the chapters grid, a soft center shadow between the two columns. The fifth
 * chapter's empty facing cell carries the one illustrated flourish on the page — a nightingale in a shaft of
 * warm light (`Nightingale`, `.landing-beam`) — rather than sitting blank.
 *
 * Both halves reveal through `ScrollReveal`: each group's own lines rise in, staggered by `--i`, only once that
 * group actually scrolls into view, rather than all firing together at mount — the welcome line as you land on
 * it, the chapter list again as you reach it, each section unfolding on its own.
 *
 * `BookIntro` is the one-time entrance in front of all of this: the same real welcome text, on a closed book
 * that opens into the page — see its own doc comment for why it's safe to fail and never re-shows.
 */
export function MystBookLanding({
  eyebrow,
  title,
  intro,
  contentsLabel,
  copy,
  welcomeModalSeen,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  contentsLabel: string;
  copy: Record<ChapterKey, { title: string; subtitle: string }>;
  welcomeModalSeen: boolean;
}) {
  return (
    <>
      <BookIntro eyebrow={eyebrow} title={title} intro={intro} />

      <div className="relative -mt-12 max-w-4xl sm:-mt-20 lg:ml-[4.5rem] lg:mt-0 lg:max-w-[min(56rem,calc(100%-13.5rem))]">
        <div className="book-frame landing-book-edge relative px-6 py-10 sm:px-10 sm:py-14">
          <div className="book-grain" aria-hidden="true" />

          <div className="cloth relative -mx-6 -mt-10 rounded-t-[1.75rem] px-6 py-8 sm:-mx-10 sm:-mt-14 sm:px-10 sm:py-10">
            <ScrollReveal className="relative text-left">
              <p className="reveal-item text-xs font-medium uppercase tracking-[0.14em] text-cloth-ink/65" style={{ ["--i" as string]: 0 } as CSSProperties}>
                {eyebrow}
              </p>
              <h1
                className="reveal-item mt-5 text-center font-display text-[clamp(1.75rem,1.2rem+1.7vw,2.5rem)] leading-[1.1] tracking-[-0.01em] text-cloth-ink sm:whitespace-nowrap [&:lang(hy)]:whitespace-normal"
                style={{ ["--i" as string]: 1 } as CSSProperties}
              >
                {title}
              </h1>
              <p className="reveal-item mx-auto mt-4 max-w-[46ch] text-center text-[1.0625rem] leading-relaxed text-cloth-ink/70" style={{ ["--i" as string]: 2 } as CSSProperties}>
                {intro}
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal className="relative mt-10 sm:mt-12">
            <p className="reveal-item mb-6 text-xs font-medium uppercase tracking-[0.14em] text-muted sm:mb-8" style={{ ["--i" as string]: 0 } as CSSProperties}>
              {contentsLabel}
            </p>
            <div className="relative border-b border-rule">
              <div className="landing-spine hidden lg:block" aria-hidden="true" />
              <ol className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-16">
                {CHAPTERS.map((chapter, index) => (
                  <ChapterCard
                    key={chapter.key}
                    index={index + 1}
                    numeral={chapter.numeral}
                    icon={chapter.icon}
                    title={copy[chapter.key].title}
                    subtitle={copy[chapter.key].subtitle}
                    href={chapter.href}
                  />
                ))}
                <li
                  aria-hidden="true"
                  className="chapter-row relative hidden lg:col-start-2 lg:row-start-3 lg:flex lg:items-center lg:justify-center"
                  style={{ ["--i" as string]: CHAPTERS.length + 1 } as CSSProperties}
                >
                  <div className="landing-beam" />
                  <Nightingale className="relative size-40 text-[color:var(--scene-walnut)] opacity-70" />
                </li>
              </ol>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {!welcomeModalSeen && <WelcomeModal />}
    </>
  );
}
