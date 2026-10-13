interface Spine {
  w: number;
  h: number;
  fill: string;
  tilt?: number;
}

/** One continuous shelf's worth of spines, left to right — widths, heights and the odd tilt chosen by hand for
 *  rhythm, not generated, so the row reads as arranged rather than randomized. Colors are every one of the app's
 *  own warm tokens (`--scene-*`, plus a single `--marker` pop near the middle, the one signature-device nod) —
 *  kept to the lighter half of that palette (parchment/ivory/candle, walnut only ever mixed toward parchment,
 *  never toward espresso) so the row stays airy rather than reading as a wall of dark wood. */
const SPINES: Spine[] = [
  { w: 22, h: 96, fill: "var(--scene-parchment)" },
  { w: 28, h: 118, fill: "color-mix(in oklab, var(--scene-candle) 75%, var(--scene-walnut))" },
  { w: 20, h: 86, fill: "var(--scene-ivory)", tilt: -6 },
  { w: 26, h: 128, fill: "color-mix(in oklab, var(--scene-walnut) 55%, var(--scene-parchment))" },
  { w: 32, h: 92, fill: "var(--scene-parchment)" },
  { w: 18, h: 108, fill: "color-mix(in oklab, var(--scene-candle) 85%, var(--scene-walnut))", tilt: 5 },
  { w: 24, h: 100, fill: "var(--scene-ivory)" },
  { w: 30, h: 122, fill: "color-mix(in oklab, var(--scene-walnut) 65%, var(--scene-parchment))" },
  { w: 22, h: 90, fill: "color-mix(in oklab, var(--marker) 65%, var(--scene-parchment))" },
  { w: 26, h: 114, fill: "var(--scene-parchment)", tilt: -4 },
  { w: 20, h: 96, fill: "color-mix(in oklab, var(--scene-walnut) 50%, var(--scene-parchment))" },
  { w: 28, h: 106, fill: "var(--scene-ivory)" },
  { w: 24, h: 118, fill: "color-mix(in oklab, var(--scene-candle) 78%, var(--scene-walnut))" },
  { w: 20, h: 88, fill: "var(--scene-parchment)", tilt: 4 },
  { w: 26, h: 104, fill: "color-mix(in oklab, var(--scene-walnut) 45%, var(--scene-parchment))" },
  { w: 22, h: 112, fill: "var(--scene-ivory)" },
];

const SHELF_Y = 200;
const GAP = 4;
const START_X = 26;

/**
 * Books' own hero scene: one continuous shelf of spines, drawn in flat shapes from the app's own warm tokens
 * rather than a photograph — the same turn every other section already took, just for a shelf instead of a page.
 * A couple of spines lean, echoing `EmptyShelf`'s own motif, the one piece of continuity between that empty
 * state and this always-visible hero. Meant to sit full-bleed on top of `.shelf-hero`'s own frosted glass (see
 * `BooksHero`), so the row runs the SVG's full width rather than centering. The spines themselves carry
 * `.shelf-books` (a CSS opacity cut, in globals.css) — translucent like colored glass, the same frosted quality
 * `.shelf-glass` gives the title panel, carried across the whole row rather than stopping at its edge; a thin
 * stroke keeps each spine legible once its fill is that light. The shelf itself stays solid — something has to
 * ground the row.
 */
export function BookshelfScene({ className }: { className?: string }) {
  let x = START_X;
  const spines = SPINES.map((s, i) => {
    const rect = { x, y: SHELF_Y - s.h, w: s.w, h: s.h };
    x += s.w + GAP;
    return { ...s, ...rect, key: i };
  });
  const width = x + START_X;

  return (
    <svg viewBox={`0 0 ${width} 220`} className={className} fill="none" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <ellipse cx={width / 2} cy={SHELF_Y + 20} rx={width * 0.46} ry="10" fill="var(--scene-walnut)" opacity="0.14" />

      <g className="shelf-books">
        {spines.map((s) => (
          <g key={s.key} transform={s.tilt ? `rotate(${s.tilt} ${s.x + s.w / 2} ${SHELF_Y})` : undefined}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="3" fill={s.fill} stroke="var(--scene-walnut)" strokeOpacity="0.3" strokeWidth="1" />
            <rect x={s.x} y={s.y} width={Math.min(6, s.w * 0.25)} height={s.h} rx="3" fill="#000" opacity="0.1" />
            <rect x={s.x} y={s.y} width={s.w} height="4" rx="2" fill="#fff" opacity="0.3" />
          </g>
        ))}
      </g>

      <rect x="4" y={SHELF_Y} width={width - 8} height="13" rx="6" fill="color-mix(in oklab, var(--scene-walnut) 58%, var(--scene-parchment))" />
      <rect x="4" y={SHELF_Y} width={width - 8} height="4" rx="2" fill="var(--scene-candle)" opacity="0.4" />
    </svg>
  );
}
