"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Quill, QUILL_NIB, QUILL_VIEWBOX } from "./Quill";

const QUILL_WIDTH = 150;
const SCALE = QUILL_WIDTH / QUILL_VIEWBOX.w;
const NIB = { x: QUILL_NIB.x * SCALE, y: QUILL_NIB.y * SCALE };

/** How long the finished page stays before it is cleared and written again. */
const HOLD_MS = 5000;

const words = (text: string) => text.match(/\S+\s*/g) ?? [];
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
/** How long a word takes to write: longer words take longer. */
const writeMs = (word: string) => 120 + word.trim().length * 30;

interface Pos {
  x: number;
  y: number;
  ms: number;
  ease: "linear" | "easeInOut";
}

interface Word {
  text: string;
  mark: boolean;
}

interface Line {
  words: Word[];
  /** First line of a new stanza (gets a little air above it). */
  stanza: boolean;
}

/**
 * Turns the poem string into lines of words. Lines are separated by "\n" and stanzas by a blank line; `mark` is the
 * phrase to highlight (matched word by word, so it may sit anywhere and even span lines).
 */
function parsePoem(text: string, mark: string): Line[] {
  const lines: Line[] = [];
  let stanza = false;
  for (const raw of text.split("\n")) {
    if (raw.trim() === "") {
      stanza = lines.length > 0;
      continue;
    }
    lines.push({ words: words(raw).map((w) => ({ text: w, mark: false })), stanza });
    stanza = false;
  }

  const flat = lines.flatMap((l) => l.words);
  const target = words(mark).map((w) => w.trim());
  if (target.length > 0) {
    for (let i = 0; i + target.length <= flat.length; i++) {
      if (target.every((w, j) => flat[i + j]!.text.trim() === w)) {
        for (let j = 0; j < target.length; j++) flat[i + j]!.mark = true;
        break;
      }
    }
  }
  return lines;
}

/**
 * The brand image: a manuscript page with a poem, written by a quill. The feather lifts from the margin, and its nib
 * travels along the lines writing them word by word (each word is revealed as the nib passes, hopping to the next line
 * at a line break). The marker then highlights the closing phrase, the quill writes the note in the margin and lies
 * down there. After a pause the page fades and the whole thing is written again, on a loop. With reduced motion the
 * finished page is shown, still.
 */
export function WritingSheet() {
  const t = useTranslations("shell");
  const locale = useLocale();
  const reduced = useReducedMotion();

  const lines = parsePoem(t("poem.text"), t("poem.mark"));
  const poemWords = lines.flatMap((l) => l.words);
  const note = words(t("note"));
  const total = poemWords.length + note.length;

  const sheet = useRef<HTMLDivElement>(null);
  const poemEl = useRef<HTMLQuoteElement>(null);
  const noteEl = useRef<HTMLParagraphElement>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const [written, setWritten] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const [writing, setWriting] = useState(false);
  const [fading, setFading] = useState(false);
  const [ready, setReady] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0, ms: 0, ease: "easeInOut" });

  useEffect(() => {
    const block = poemEl.current;
    const margin = noteEl.current;
    if (!sheet.current || !block || !margin) return;
    let cancelled = false;

    // Rest: lying in the empty top of the margin column, on the page.
    const rest = (ms: number): Pos => ({ x: margin.offsetLeft - 2, y: block.offsetTop + 4, ms, ease: "easeInOut" });
    // The quill is positioned by its nib: the tip of the word being written.
    const nibAt = (el: HTMLElement, edge: "start" | "end") => ({
      x: el.offsetLeft + (edge === "end" ? el.offsetWidth : 0) - NIB.x,
      y: el.offsetTop + el.offsetHeight * 0.8 - NIB.y,
    });

    setWritten(0);
    setHighlight(false);
    setWriting(false);
    setFading(false);
    setPos(rest(0));
    setReady(true);

    if (reduced) {
      setWritten(total);
      setHighlight(true);
      return;
    }

    (async () => {
      await document.fonts.ready;

      while (!cancelled) {
        await sleep(1300); // the quill is seen resting first
        let lastTop: number | null = null;
        setWriting(true);

        for (let i = 0; i < total; i++) {
          const el = els.current[i];
          if (cancelled) return;
          if (!el) continue;

          if (i === poemWords.length) {
            // poem finished: highlight the closing phrase, then carry on in the margin
            setHighlight(true);
            await sleep(1000);
            if (cancelled) return;
            lastTop = null;
          }

          const first = lastTop === null;
          const newLine = lastTop !== null && Math.abs(el.offsetTop - lastTop) > 4;
          if (first || newLine) {
            const hop = first ? 700 : 340;
            setPos({ ...nibAt(el, "start"), ms: hop, ease: "easeInOut" });
            await sleep(hop);
            if (cancelled) return;
          }

          const word = i < poemWords.length ? poemWords[i]!.text : note[i - poemWords.length]!;
          const ms = writeMs(word);
          setPos({ ...nibAt(el, "end"), ms, ease: "linear" });
          setWritten(i + 1);
          await sleep(ms);
          lastTop = el.offsetTop;
        }

        if (cancelled) return;
        await sleep(350);
        setPos(rest(900));
        await sleep(850);
        if (cancelled) return;
        setWriting(false);

        // The finished page is held, then cleared (faded, so the un-writing is never seen) and written again.
        await sleep(HOLD_MS);
        if (cancelled) return;
        setFading(true);
        await sleep(750);
        if (cancelled) return;
        setWritten(0);
        setHighlight(false);
        await sleep(600);
        if (cancelled) return;
        setFading(false);
        await sleep(500);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Restarts when the language changes (different words, different layout).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, reduced]);

  let index = 0;
  const word = (w: string, i: number) => (
    <span
      key={i}
      ref={(el) => {
        els.current[i] = el;
      }}
      className="ink-word"
      data-written={i < written}
      style={{ ["--dur" as string]: `${writeMs(w)}ms` } as CSSProperties}
    >
      {w}
    </span>
  );

  return (
    <figure className="animate-rise relative mx-auto w-full max-w-[34rem] -rotate-[1.2deg]">
      <div ref={sheet} className="sheet relative rounded-[0.35rem] px-9 pb-8 pt-10 xl:px-11">
        <div className={`transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}>
          <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-x-8">
            <blockquote ref={poemEl} className="poem font-display text-[1.3rem] leading-[1.42] xl:text-[1.5rem]">
              {lines.map((line, li) => {
                // consecutive marked words share one <mark> so the marker sweeps as a single stroke
                const runs: { mark: boolean; items: Word[] }[] = [];
                for (const w of line.words) {
                  const last = runs[runs.length - 1];
                  if (last && last.mark === w.mark) last.items.push(w);
                  else runs.push({ mark: w.mark, items: [w] });
                }
                return (
                  <span key={li} className={`block ${line.stanza ? "mt-[0.75em]" : ""}`}>
                    {runs.map((run, ri) =>
                      run.mark ? (
                        <mark key={ri} className={highlight ? "marker marker-sweep" : "marker marker-wait"} style={{ ["--sweep-delay" as string]: "0ms" }}>
                          {run.items.map((w) => word(w.text, index++))}
                        </mark>
                      ) : (
                        run.items.map((w) => word(w.text, index++))
                      ),
                    )}
                  </span>
                );
              })}
            </blockquote>

            <p ref={noteEl} className="self-end pb-1 font-display text-[1.05rem] italic leading-snug text-[color:var(--pencil)]">
              {note.map((w, j) => word(w, poemWords.length + j))}
            </p>
          </div>

          <figcaption
            className={`mt-9 border-t border-[color:var(--sheet-ink)]/15 pt-3.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[color:var(--sheet-ink)]/60 transition-opacity duration-700 ${
              written >= poemWords.length ? "opacity-100" : "opacity-0"
            }`}
          >
            {t("poem.author")}
          </figcaption>
        </div>

        <motion.div
          className="quill-wrap pointer-events-none absolute left-0 top-0 z-10"
          style={{ width: QUILL_WIDTH, opacity: ready ? 1 : 0 }}
          initial={false}
          animate={{ x: pos.x, y: pos.y }}
          transition={{ duration: pos.ms / 1000, ease: pos.ease }}
        >
          <Quill writing={writing} />
        </motion.div>
      </div>
    </figure>
  );
}
