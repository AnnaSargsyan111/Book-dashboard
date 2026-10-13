"use client";

import { useReducedMotion } from "motion/react";

/**
 * Forgot password scene: a stack of old books with an open book on top, its pages turning one after another, on a
 * loop. Original vector art.
 *
 * The page turn is drawn frame by frame from a small model rather than by rotating a rigid shape: a page is a curved
 * strip rooted at the spine. As it turns from the right stack to the left, its root lifts and sweeps over, while the
 * free edge trails behind (the strip bends most at mid-turn), it is thin when lying flat and broad when upright, and it
 * eases in and out. Three pages take turns, so one is always mid-turn; each fades out once it has settled on the left
 * and fades back in on the right, which keeps the loop seamless. With reduced motion the pages rest as an open fan.
 */
const SPINE = { x: 200, y: 186 };
const ROOT = { x: SPINE.x, y: SPINE.y + 2 };

/** Length of a turning page and how far its free edge lags at the peak of the turn (radians). */
const LENGTH = 142;
const MAX_LAG = 1.05;
const SAMPLES = 16;

/** Seconds for one page's whole cycle; the pages are spaced a third of a cycle apart. */
const CYCLE = 7.5;
const PAGES = 3;
/** Share of the cycle: waiting flat on the right, turning, then resting on the left. */
const WAIT = 0.1;
const TURN = 0.26;
const FRAMES = 26;

const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

/**
 * Outline of a page `t` of the way through its turn (0 = flat on the right, 1 = flat on the left).
 * Every call returns a path with the same number of points, so the browser can morph between them.
 */
function pagePath(t: number): string {
  const root = Math.PI * t; // direction of the page where it leaves the spine, counter-clockwise from "right"
  const lag = MAX_LAG * Math.pow(Math.sin(Math.PI * t), 1.15);
  const seg = LENGTH / SAMPLES;

  const upper: string[] = [];
  const lower: string[] = [];
  let x = ROOT.x;
  let y = ROOT.y;
  for (let i = 0; i <= SAMPLES; i++) {
    const s = i / SAMPLES;
    const dir = root - lag * s; // the free edge trails behind the root
    // Broad blade when the page stands upright, slim when it lies flat; widening towards the free edge.
    const width = (4 + 42 * Math.pow(s, 0.85)) * (0.2 + 0.8 * Math.abs(Math.sin(dir)));
    const nx = Math.sin(dir);
    const ny = Math.cos(dir);
    upper.push(`${(x + (nx * width) / 2).toFixed(1)} ${(y + (ny * width) / 2).toFixed(1)}`);
    lower.push(`${(x - (nx * width) / 2).toFixed(1)} ${(y - (ny * width) / 2).toFixed(1)}`);
    x += Math.cos(dir) * seg;
    y -= Math.sin(dir) * seg;
  }
  return `M${upper.join(" L")} L${lower.reverse().join(" L")} Z`;
}

/** One value per animation frame: rest on the right, the eased turn, then rest on the left for the remainder. */
const TURN_FRAMES = Array.from({ length: FRAMES }, (_, i) => pagePath(smoother(i / (FRAMES - 1))));
const D_VALUES = [TURN_FRAMES[0]!, ...TURN_FRAMES, TURN_FRAMES[FRAMES - 1]!].join(";");
const D_TIMES = [0, WAIT, ...Array.from({ length: FRAMES - 1 }, (_, i) => WAIT + (TURN * (i + 1)) / (FRAMES - 1)), 1]
  .map((k) => k.toFixed(4))
  .join(";");

/** Resting pose for reduced motion: the pages fanned open. */
const FAN = [0.16, 0.36, 0.56, 0.76].map((t) => pagePath(t));

/** Flat pages lying out from the spine on one side (the blocks the turning pages sit on). */
function flatPages(side: -1 | 1) {
  return Array.from({ length: 6 }, (_, i) => {
    const k = i / 5;
    const len = 150 - k * 12;
    const lift = 4 + k * 26;
    const x = SPINE.x + side * len;
    const y = SPINE.y + 4 - lift;
    return {
      d: `M${SPINE.x} ${SPINE.y + 6} C${SPINE.x + side * len * 0.3} ${SPINE.y - lift * 1.3} ${SPINE.x + side * len * 0.75} ${SPINE.y - lift * 0.9 + 2} ${x} ${y} L${x} ${y + 4.5} C${SPINE.x + side * len * 0.75} ${SPINE.y - lift * 0.9 + 6} ${SPINE.x + side * len * 0.3} ${SPINE.y - lift * 1.3 + 5} ${SPINE.x} ${SPINE.y + 10} Z`,
      shade: 0.98 - k * 0.14,
    };
  });
}

const LEFT = flatPages(-1);
const RIGHT = flatPages(1);

export function PagesScene() {
  const reduced = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-[10/9] w-full max-w-[34rem]" aria-hidden="true">
      <svg viewBox="0 0 400 360" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="pg-cream" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#f6e6bb" />
            <stop offset="1" stopColor="#e3c88c" />
          </linearGradient>
          <linearGradient id="bk-leather" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9a26b" />
            <stop offset="1" stopColor="#b3733d" />
          </linearGradient>
          <linearGradient id="bk-linen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9dcbb" />
            <stop offset="1" stopColor="#cdbb93" />
          </linearGradient>
          <linearGradient id="bk-tan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dcb886" />
            <stop offset="1" stopColor="#c39a66" />
          </linearGradient>
        </defs>

        {/* soft shadow on the table */}
        <ellipse cx="200" cy="349" rx="170" ry="9" fill="#000" opacity="0.28" style={{ filter: "blur(6px)" }} />

        {/* bottom book: leather */}
        <rect x="48" y="300" width="302" height="46" rx="5" fill="url(#bk-leather)" />
        <rect x="48" y="300" width="302" height="5" rx="2.5" fill="#fff" opacity="0.18" />
        <rect x="48" y="338" width="302" height="8" rx="3" fill="#000" opacity="0.14" />
        {/* second: linen */}
        <rect x="62" y="262" width="278" height="38" rx="4" fill="url(#bk-linen)" />
        <path d="M112 262V300M170 262V300M262 262V300" stroke="#8a7650" strokeOpacity="0.35" strokeWidth="1.2" />
        <path d="M66 273H336M66 289H336" stroke="#8a7650" strokeOpacity="0.16" strokeWidth="0.8" />
        {/* third: grey-brown, page edges showing */}
        <rect x="70" y="232" width="264" height="30" rx="3" fill="#85796a" />
        <path d="M76 240H328M76 246H328M76 252H328" stroke="#c9bda6" strokeOpacity="0.4" strokeWidth="0.9" />
        {/* fourth: tan with spine bands */}
        <rect x="78" y="192" width="250" height="40" rx="4" fill="url(#bk-tan)" />
        <path d="M108 192V232M132 192V232M156 192V232M244 192V232M268 192V232M292 192V232" stroke="#8d6a3f" strokeOpacity="0.55" strokeWidth="1.6" />
        <path d="M96 192V232M304 192V232" stroke="#8d6a3f" strokeOpacity="0.3" strokeWidth="1" />

        {/* open book on top: red cover rim, flat page blocks */}
        <path d="M28 194 Q200 184 372 194 L372 201 Q200 191 28 201 Z" fill="#b53a3a" />
        <path d="M28 194 Q200 184 372 194" stroke="#e46a5e" strokeOpacity="0.6" strokeWidth="1" />
        {LEFT.map((p, i) => (
          <path key={`l${i}`} d={p.d} fill="url(#pg-cream)" opacity={p.shade} stroke="#a9803f" strokeOpacity="0.45" strokeWidth="0.7" />
        ))}
        {RIGHT.map((p, i) => (
          <path key={`r${i}`} d={p.d} fill="url(#pg-cream)" opacity={p.shade} stroke="#a9803f" strokeOpacity="0.45" strokeWidth="0.7" />
        ))}
        <path d={`M${SPINE.x - 10} ${SPINE.y + 6} Q${SPINE.x} ${SPINE.y - 6} ${SPINE.x + 10} ${SPINE.y + 6} Z`} fill="#2a1c12" opacity="0.85" />

        {/* the turning pages */}
        {reduced
          ? FAN.map((d, i) => <path key={i} d={d} fill="url(#pg-cream)" stroke="#a9803f" strokeOpacity="0.5" strokeWidth="0.8" strokeLinejoin="round" />)
          : Array.from({ length: PAGES }, (_, k) => (
              <path key={k} d={TURN_FRAMES[0]} fill="url(#pg-cream)" stroke="#a9803f" strokeOpacity="0.5" strokeWidth="0.8" strokeLinejoin="round" opacity="0">
                <animate attributeName="d" dur={`${CYCLE}s`} begin={`${-(k * CYCLE) / PAGES}s`} repeatCount="indefinite" values={D_VALUES} keyTimes={D_TIMES} calcMode="linear" />
                {/* invisible while it jumps from the left stack back to the right */}
                <animate attributeName="opacity" dur={`${CYCLE}s`} begin={`${-(k * CYCLE) / PAGES}s`} repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;0.04;0.9;0.96;1" calcMode="linear" />
              </path>
            ))}
      </svg>
    </div>
  );
}
