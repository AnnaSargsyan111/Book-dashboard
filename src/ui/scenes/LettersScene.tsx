"use client";

import { useLocale } from "next-intl";
import type { CSSProperties } from "react";

/**
 * Log in scene: an open book whose letters — in whichever language is active — drift near its pages, gather into
 * a short maxim, hold there long enough to read, then scatter and fade before the next cycle. Original vector art.
 * All numbers are generated from a fixed seed so the server and the browser render exactly the same scene; the
 * text layout is a deterministic word-wrap (approximate glyph widths, not real font metrics — this is a line of
 * decorative type, not typeset copy).
 */
const W = 400;
const H = 360;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SENTENCES: Record<string, string> = {
  en: "Don't follow the paved road. Build your own.",
  hy: "Դու մի՛ անցիր ասֆալտ ճամփով, գերադասի՛ր ճամփա շինել",
};

const PUNCTUATION = new Set(["'", ",", ".", "՛"]);

function glyphWidth(ch: string, armenian: boolean): number {
  if (PUNCTUATION.has(ch)) return armenian ? 1.8 : 1.6;
  return armenian ? 4.0 : 3.3;
}

interface PlacedLetter {
  glyph: string;
  /** Assembled position, in cqw/cqh offset from the scene's own centre. */
  tx: number;
  ty: number;
}

/** Greedy word-wrap into centred lines, then place each glyph along its line. */
function layoutSentence(sentence: string, armenian: boolean): PlacedLetter[] {
  const spaceWidth = armenian ? 2.0 : 1.8;
  const words = sentence.split(" ").map((word) => ({
    word,
    width: [...word].reduce((w, ch) => w + glyphWidth(ch, armenian), 0),
  }));

  const maxLineWidth = 86;
  const lines: (typeof words)[] = [[]];
  let lineWidth = 0;
  for (const w of words) {
    const started = lines[lines.length - 1]!.length > 0;
    const next = lineWidth + (started ? spaceWidth : 0) + w.width;
    if (next > maxLineWidth && started) {
      lines.push([w]);
      lineWidth = w.width;
    } else {
      lines[lines.length - 1]!.push(w);
      lineWidth = next;
    }
  }

  const lineHeight = 13;
  const baseY = -12; // the block sits just above the book, in the open air over the pages
  const placed: PlacedLetter[] = [];
  lines.forEach((line, i) => {
    const width = line.reduce((w, entry, j) => w + entry.width + (j > 0 ? spaceWidth : 0), 0);
    const y = baseY + (i - (lines.length - 1) / 2) * lineHeight;
    let cursor = -width / 2;
    line.forEach((entry, j) => {
      if (j > 0) cursor += spaceWidth;
      for (const ch of entry.word) {
        const w = glyphWidth(ch, armenian);
        placed.push({ glyph: ch, tx: cursor + w / 2, ty: y });
        cursor += w;
      }
    });
  });
  return placed;
}

/* ------------------------------------------------------------------------------------------------ the book ---
   An open book as a dense, overlapping fan of leaves bound along the spine — many individual pages, packed
   close enough that neighbours touch (real page stacks have no daylight between them), curling up and out from
   a visible bound block rather than converging on a single point. The lowest couple of leaves per side lie
   almost flat, forming the readable spread; the rest climb in a gentle, continuous arc that never passes much
   beyond vertical, the shape an actual open book settles into — not a starburst. The two fans are NOT mirror
   images: the right side carries fewer, flatter leaves, like a book that has settled slightly open rather than
   one propped up symmetrically. */
type P = readonly [number, number];
const fmt = (p: P) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

/** The bound edge the leaves fan from — a short span along the spine, not a single point (a real book's pages
 *  are bound along a line, so even the base of the fan has real width). */
const SPINE_Y = 308;
const SPINE_X = 199;

interface Leaf {
  anchor: P;
  control: P;
  tip: P;
  angle: number;
  wBase: number;
  wTip: number;
}

function makeLeaf(dir: 1 | -1, anchorT: number, angle: number, length: number, bowFrac: number, wBase: number, wTip: number): Leaf {
  const anchor: P = [SPINE_X + dir * (1.5 + anchorT * 7), SPINE_Y - anchorT * 3.5];
  const rad = (angle * Math.PI) / 180;
  const tip: P = [anchor[0] + dir * Math.cos(rad) * length, anchor[1] - Math.sin(rad) * length];
  const mid: P = [(anchor[0] + tip[0]) / 2, (anchor[1] + tip[1]) / 2];
  const bow = length * bowFrac;
  const control: P = [mid[0] + dir * bow * 0.2, mid[1] + bow];
  return { anchor, control, tip, angle, wBase, wTip };
}

/** One side's fan: a handful of leaves climbing from near-flat (the readable spread) to `angleMax` — well short
 *  of vertical, the relaxed angle a real open book settles into, not a sunburst. Each leaf keeps most of its
 *  width all the way to its tip (a blunt, card-like end, not a point), and is wide enough relative to the gap
 *  to its neighbour that consecutive leaves visibly overlap — paper has no daylight between sheets. */
function fan(dir: 1 | -1, count: number, angleMax: number, lenBase: number, lenTip: number, seed: number): Leaf[] {
  const jitter = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const t = Math.pow(i / (count - 1), 0.85);
    const angle = 9 + t * (angleMax - 9) + (jitter() - 0.5) * 2.5;
    const length = lenBase + (lenTip - lenBase) * t + (jitter() - 0.5) * 3;
    const wBase = 7 + jitter() * 1.6;
    const wTip = wBase * (0.6 + jitter() * 0.12);
    return makeLeaf(dir, t, angle, length, 0.05 + jitter() * 0.025, wBase, wTip);
  });
}

const LEFT_FAN = fan(-1, 9, 64, 100, 80, 11);
const RIGHT_FAN = fan(1, 8, 54, 94, 80, 53);

/** Offsets a leaf's own three points perpendicular to its own chord — an approximation that is more than good
 *  enough at this size — to turn its centreline into a thin paper ribbon with real, tapering width. */
function ribbon(leaf: Leaf): string {
  const dx = leaf.tip[0] - leaf.anchor[0];
  const dy = leaf.tip[1] - leaf.anchor[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const off = (p: P, w: number, s: 1 | -1): P => [p[0] + s * nx * w, p[1] + s * ny * w];
  const wMid = (leaf.wBase + leaf.wTip) / 2;
  const a0 = off(leaf.anchor, leaf.wBase, 1);
  const aC = off(leaf.control, wMid, 1);
  const a1 = off(leaf.tip, leaf.wTip, 1);
  const b0 = off(leaf.anchor, leaf.wBase, -1);
  const bC = off(leaf.control, wMid, -1);
  const b1 = off(leaf.tip, leaf.wTip, -1);
  return `M${fmt(a0)} Q${fmt(aC)} ${fmt(a1)} L${fmt(b1)} Q${fmt(bC)} ${fmt(b0)} Z`;
}

/** A thin line across a leaf's width, following its own curve — the faint suggestion of text, used only on the
 *  one or two flattest leaves per side where we would actually see a page's printed face. */
function rowLine(leaf: Leaf, w: number): string {
  const dx = leaf.tip[0] - leaf.anchor[0];
  const dy = leaf.tip[1] - leaf.anchor[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const off = (p: P): P => [p[0] + nx * w, p[1] + ny * w];
  return `M${fmt(off(leaf.anchor))} Q${fmt(off(leaf.control))} ${fmt(off(leaf.tip))}`;
}

function buildSide(leaves: Leaf[], seed: number) {
  const jitter = mulberry32(seed);
  return leaves.map((leaf, i) => {
    const rows =
      i < 2
        ? Array.from({ length: 4 }, (_, k) => ({ d: rowLine(leaf, leaf.wBase * (0.5 - k * 0.28)), opacity: 0.2 + jitter() * 0.12 }))
        : [];
    return { ...leaf, fill: ribbon(leaf), shade: 0.72 + jitter() * 0.28, rows };
  });
}

const LEFT = buildSide(LEFT_FAN, 71);
const RIGHT = buildSide(RIGHT_FAN, 97);

/** The hardcover boards: dark, flat, and roughly as wide as the fan's own reach — lying open on the table
 *  beneath the pages, the way a real hardback's covers splay out under the page block. */
const COVER_LEFT = "M96 315 C96 307 140 304 199 309 L199 324 C144 321 112 323 96 324 Z";
const COVER_RIGHT = "M302 315 C302 307 258 304 201 309 L201 324 C256 321 286 323 302 324 Z";
/** The small dark nub that caps the fan's base, hiding the point where every leaf's anchor converges. */
const SPINE_CAP = "M190 303 C190 298 208 298 208 303 L208 313 C208 318 190 318 190 313 Z";

export function LettersScene() {
  const locale = useLocale();
  const armenian = locale === "hy";
  const rand = mulberry32(11);
  const letters = layoutSentence(SENTENCES[locale] ?? SENTENCES.en!, armenian).map((l) => ({
    ...l,
    srot: (rand() - 0.5) * 70,
    sscale: 0.55 + rand() * 0.25,
    sx: (rand() - 0.5) * 72,
    sy: 4 + rand() * 16, // a loose cloud just above the book, where the scattered state gathers
    delay: rand() * 0.6,
  }));

  return (
    // `key={locale}` forces a full remount on a live language switch — otherwise React reuses DOM nodes by
    // index across two different-length letter arrays, leaving reused letters mid-cycle on their old English
    // schedule while the extra Armenian ones start fresh, permanently out of sync with each other.
    <div key={locale} className="letters relative mx-auto aspect-[10/9] w-full max-w-[34rem]" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <defs>
          {/* the hardcover boards: near-black, with just enough sheen to read as a material, not a silhouette */}
          <linearGradient id="cover-left" gradientUnits="userSpaceOnUse" x1="96" y1="305" x2="199" y2="324">
            <stop offset="0" stopColor="#2a211a" />
            <stop offset="1" stopColor="#0a0705" />
          </linearGradient>
          <linearGradient id="cover-right" gradientUnits="userSpaceOnUse" x1="302" y1="305" x2="201" y2="324">
            <stop offset="0" stopColor="#2a211a" />
            <stop offset="1" stopColor="#0a0705" />
          </linearGradient>
          <linearGradient id="spine-cap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22190f" />
            <stop offset="1" stopColor="#0a0603" />
          </linearGradient>
        </defs>

        {/* shadow on the table: a soft wide cast plus a tighter contact shadow, then the book from the bottom up */}
        <ellipse cx="200" cy="326" rx="118" ry="8" fill="#000" opacity="0.2" style={{ filter: "blur(9px)" }} />
        <ellipse cx="200" cy="321" rx="70" ry="4.5" fill="#000" opacity="0.3" style={{ filter: "blur(3px)" }} />

        {/* the hardcover boards, splayed open flat beneath the fan of pages */}
        <path d={COVER_LEFT} fill="url(#cover-left)" />
        <path d={COVER_RIGHT} fill="url(#cover-right)" />

        {[LEFT, RIGHT].map((side, si) => (
          <g key={si}>
            {/* steepest (outermost) leaves first, so the flatter spread leaves overlap them, nearest to the viewer */}
            {[...side].reverse().map((leaf, j) => (
              <g key={j}>
                <path
                  d={leaf.fill}
                  fill={`color-mix(in oklab, #f7edc9 ${Math.round(leaf.shade * 100)}%, #c6a868)`}
                  stroke="#d9a53a"
                  strokeOpacity="0.55"
                  strokeWidth="0.45"
                />
                {leaf.rows.map((r, k) => (
                  <path key={k} d={r.d} stroke="#6f5626" strokeOpacity={r.opacity} strokeWidth="0.55" strokeLinecap="round" />
                ))}
              </g>
            ))}
          </g>
        ))}

        {/* caps the point where every leaf's anchor converges, reading as the spine binding them together */}
        <path d={SPINE_CAP} fill="url(#spine-cap)" />
      </svg>

      {/* letters gather near the pages, assemble into the sentence, hold, then scatter and fade — on a loop */}
      {letters.map((l, i) => (
        <span
          key={i}
          lang={armenian ? "hy" : undefined}
          className="sentence-letter font-display"
          style={
            {
              ["--tx" as string]: `${l.tx}cqw`,
              ["--ty" as string]: `${l.ty}cqh`,
              ["--sx" as string]: `${l.sx}cqw`,
              ["--sy" as string]: `${l.sy}cqh`,
              ["--srot" as string]: `${l.srot}deg`,
              ["--sscale" as string]: l.sscale,
              ["--delay" as string]: `${l.delay}s`,
            } as CSSProperties
          }
        >
          {l.glyph}
        </span>
      ))}
    </div>
  );
}
