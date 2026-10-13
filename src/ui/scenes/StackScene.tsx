"use client";

import { useTranslations } from "next-intl";
import { useState, type CSSProperties } from "react";

/**
 * Onboarding scene: pastel books drop onto a stack one by one, a yellow line draws in above them, a quote about
 * reading is highlighted, then the scene fades and the chain starts again with the next quote. Original vector art.
 *
 * The end of the fade (an animation event, not a timer) restarts the round and advances the quote, so picture and
 * text cannot drift apart. With reduced motion nothing animates: the finished stack and the first quote stay.
 */
const QUOTES = ["bacon", "dickinson", "milton", "thoreau"] as const;

const BASE_Y = 346;
const CENTER_X = 204;

interface BookSpec {
  w: number;
  h: number;
  color: string;
  dx: number;
  /** "spine": a cover seen from the side. "pages": a book seen from the page edge, cover slabs top and bottom. */
  kind: "spine" | "pages";
}

/** Bottom to top. The palette follows the soft peach / cream / sage of the reference photo. */
const BOOKS: BookSpec[] = [
  { w: 204, h: 42, color: "#9cc4b4", dx: -2, kind: "spine" },
  { w: 188, h: 36, color: "#e6dccb", dx: 5, kind: "spine" },
  { w: 196, h: 34, color: "#edb98c", dx: -6, kind: "spine" },
  { w: 178, h: 15, color: "#cfd0d6", dx: 3, kind: "spine" },
  { w: 142, h: 40, color: "#86ae9f", dx: -3, kind: "pages" },
  { w: 152, h: 8, color: "#8fb6a6", dx: 2, kind: "spine" },
];

function Book({ spec, index, y }: { spec: BookSpec; index: number; y: number }) {
  const { w, h, color, dx, kind } = spec;
  const x = CENTER_X - w / 2 + dx;
  return (
    <g className="pile-book" style={{ ["--i" as string]: index } as CSSProperties}>
      {kind === "spine" ? (
        <>
          <rect x={x} y={y} width={w} height={h} rx="3" fill={color} />
          <rect x={x + w - 15} y={y + 3.5} width="12" height={Math.max(2, h - 7)} rx="1.5" fill="#f7f1e2" opacity="0.9" />
          <rect x={x} y={y} width={w} height="2.4" rx="1.2" fill="#fff" opacity="0.32" />
          <rect x={x + 10} y={y} width="2.6" height={h} fill="#000" opacity="0.09" />
        </>
      ) : (
        <>
          {/* seen from the page edge: cover slabs above and below a block of yellowed pages */}
          <rect x={x} y={y + 6} width={w} height={h - 12} fill="#ecdca8" />
          <path d={[1, 2, 3, 4, 5].map((n) => `M${x + 3} ${y + 6 + (n * (h - 12)) / 6}H${x + w - 3}`).join("")} stroke="#a98a4c" strokeOpacity="0.4" strokeWidth="0.7" />
          <path d={`M${x + 22} ${y + 12}h12M${x + 44} ${y + 14}h9`} stroke="#5f8fb0" strokeOpacity="0.5" strokeWidth="2.2" strokeLinecap="round" />
          <rect x={x - 2} y={y} width={w + 4} height="7.5" rx="2" fill={color} />
          <rect x={x - 2} y={y + h - 7.5} width={w + 4} height="7.5" rx="2" fill={color} />
        </>
      )}
    </g>
  );
}

/** Stack positions: each book sits on the previous one. */
function layout() {
  let y = BASE_Y;
  return BOOKS.map((spec, index) => {
    y -= spec.h;
    return { spec, index, y };
  });
}

export function StackScene() {
  const t = useTranslations("shell.pile");
  const [cycle, setCycle] = useState(0);
  const id = QUOTES[cycle % QUOTES.length]!;
  const q = t as unknown as (key: string) => string;
  const books = layout();
  const top = books[books.length - 1]!.y;

  return (
    <div key={cycle} className="pile-cycle mx-auto w-full max-w-[31rem]" onAnimationEnd={(e) => e.target === e.currentTarget && setCycle((n) => n + 1)} aria-hidden="true">
      <svg viewBox="40 8 340 372" className="mx-auto h-auto max-h-[46vh] w-full" fill="none">
        <defs>
          <clipPath id="pile-card">
            <rect x="70" y="26" width="270" height="330" rx="46" />
          </clipPath>
          <clipPath id="pile-circle">
            <circle cx="98" cy="98" r="46" />
          </clipPath>
          <linearGradient id="pile-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--marker)" stopOpacity="0" />
            <stop offset="0.45" stopColor="var(--marker)" stopOpacity="0.9" />
            <stop offset="1" stopColor="#9cc4b4" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="pile-sun" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6eab8" />
            <stop offset="1" stopColor="#dcc47c" />
          </linearGradient>
        </defs>

        {/* the card: soft panel, a lighter column on its right, an accent bar down the left edge */}
        <rect x="70" y="26" width="270" height="330" rx="46" fill="rgb(255 255 255 / 0.045)" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1.2" />
        <g clipPath="url(#pile-card)">
          <rect x="296" y="20" width="60" height="346" fill="rgb(255 255 255 / 0.075)" />
          <rect x="70" y="120" width="7" height="250" fill="url(#pile-bar)" />
        </g>

        {/* close-up of book spines, in a circle */}
        <circle cx="98" cy="98" r="49" fill="#0e2726" opacity="0.5" />
        <g clipPath="url(#pile-circle)">
          <rect x="40" y="46" width="120" height="30" fill="#edb98c" />
          <rect x="40" y="76" width="120" height="30" fill="#e6dccb" />
          <rect x="40" y="106" width="120" height="44" fill="#9cc4b4" />
          <rect x="40" y="75" width="120" height="2.4" fill="#000" opacity="0.14" />
          <rect x="40" y="105" width="120" height="2.4" fill="#000" opacity="0.14" />
          <rect x="40" y="46" width="120" height="6" fill="#fff" opacity="0.18" />
        </g>
        <circle cx="98" cy="98" r="46" stroke="rgb(255 255 255 / 0.5)" strokeWidth="1.4" />

        {/* the yellow line draws in above the stack */}
        <path
          className="pile-line"
          pathLength={500}
          d={`M244 24 C244 58 290 58 276 94 C264 126 206 112 ${CENTER_X} ${top - 44} C${CENTER_X - 2} ${top - 24} ${CENTER_X + 4} ${top - 12} ${CENTER_X + 2} ${top - 4}`}
          stroke="var(--marker)"
          strokeWidth="4.4"
          strokeLinecap="round"
        />

        {/* specks and the cream sun */}
        <circle cx="352" cy="70" r="3.2" fill="#8fd0b0" />
        <circle cx="372" cy="96" r="2.2" fill="#9fb5d4" />
        <circle cx="62" cy="292" r="3" fill="#dba3a1" />
        <circle cx="330" cy="332" r="30" fill="url(#pile-sun)" />

        {/* the surface the books rest on, and its shadow */}
        <ellipse cx={CENTER_X} cy={BASE_Y + 6} rx="126" ry="7" fill="#000" opacity="0.28" style={{ filter: "blur(5px)" }} />
        <rect x="88" y={BASE_Y} width="232" height="9" rx="4.5" fill="#3f706a" />

        {books.map((b) => (
          <Book key={b.index} {...b} />
        ))}
      </svg>

      <figure className="mt-6 min-h-[8.5rem]">
        <blockquote className="font-display text-[1.4rem] leading-[1.34] text-cloth-ink xl:text-[1.6rem]">
          {q(`${id}.pre`)}
          <mark className="marker-dark" style={{ ["--sweep-delay" as string]: "3.3s" }}>
            {q(`${id}.mark`)}
          </mark>
          {q(`${id}.post`)}
        </blockquote>
        <figcaption className="mt-4 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-cloth-ink/60">{q(`${id}.author`)}</figcaption>
      </figure>
    </div>
  );
}
