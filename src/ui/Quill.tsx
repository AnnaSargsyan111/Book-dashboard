/** Natural size of the drawing (SVG viewBox units). The nib, bottom left, is the point that touches the page. */
export const QUILL_VIEWBOX = { w: 170, h: 74 } as const;
export const QUILL_NIB = { x: 4, y: 68 } as const;

type Point = readonly [number, number];

/** The shaft is one gently arching curve from the nib to the tip; everything else is built around it. */
const P0: Point = [4, 68];
const P1: Point = [86, 46];
const P2: Point = [167, 9];

function shaft(t: number): { p: Point; n: Point } {
  const u = 1 - t;
  const p: Point = [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
  const dx = 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
  const dy = 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
  const len = Math.hypot(dx, dy);
  // unit normal pointing up-left (the broad side of the vane)
  return { p, n: [dy / len, -dx / len] };
}

/** Where the bare hollow quill ends and the vane begins, as a share of the shaft. */
const START = 0.2;

/** Small deterministic wobble so the edges and barbs look grown, not ruled. */
const wobble = (i: number) => Math.sin(i * 12.9898) * 0.5 + Math.sin(i * 4.1414) * 0.5;

/**
 * Half-width of the vane at position t. A half-ellipse (broad in the middle, rounding off at the tip) with two or
 * three narrow splits cut into it, which is what makes a feather read as a feather rather than a leaf.
 */
function vane(t: number, max: number, splits: number[]): number {
  if (t <= START) return 0;
  const u = (t - START) / (1 - START);
  const shape = Math.pow(Math.sqrt(Math.max(0, 1 - Math.pow(2 * Math.pow(u, 0.82) - 1, 2))), 0.8);
  const cut = splits.reduce((c, s) => c * (1 - 0.62 * Math.exp(-Math.pow((u - s) / 0.012, 2))), 1);
  return max * shape * cut;
}

const upper = (t: number) => vane(t, 12.5, [0.34, 0.6, 0.83]);
const lower = (t: number) => vane(t, 7.2, [0.27, 0.5, 0.72]);

const at = (t: number, d: number): Point => {
  const { p, n } = shaft(t);
  return [p[0] + n[0] * d, p[1] + n[1] * d];
};
const fmt = (pt: Point) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;

const STEPS = 90;
const ts = Array.from({ length: STEPS + 1 }, (_, i) => START + ((1 - START) * i) / STEPS);
const shaftEdge = ts.map((t) => at(t, 0));
const upperEdge = ts.map((t) => at(t, upper(t)));
const lowerEdge = ts.map((t) => at(t, -lower(t)));
const back = (pts: Point[]) => [...pts].reverse().map((p) => `L${fmt(p)}`).join(" ");

const UPPER_VANE = `M${fmt(shaftEdge[0]!)} ${upperEdge.map((p) => `L${fmt(p)}`).join(" ")} ${back(shaftEdge)} Z`;
const LOWER_VANE = `M${fmt(shaftEdge[0]!)} ${lowerEdge.map((p) => `L${fmt(p)}`).join(" ")} ${back(shaftEdge)} Z`;
/** A soft highlight running along the broad side of the vane: the sheen of a dark feather. */
const SHEEN = `M${fmt(shaftEdge[8]!)} ${ts.slice(8, 78).map((t) => `L${fmt(at(t, upper(t) * 0.55))}`).join(" ")} ${ts.slice(8, 78).reverse().map((t) => `L${fmt(at(t, upper(t) * 0.08))}`).join(" ")} Z`;

const SHAFT = `M${fmt(P0)} Q${fmt(P1)} ${fmt(P2)}`;
/** The hollow quill: thicker, from the nib to where the vane starts. */
const CALAMUS = `M${fmt(P0)} ${Array.from({ length: 13 }, (_, i) => `L${fmt(shaft((START * (i + 1)) / 13).p)}`).join(" ")}`;

/** Barbs: many fine strokes from the shaft to the edge, leaning towards the tip, a little irregular. */
const BARBS_UP: string[] = [];
const BARBS_LOW: string[] = [];
for (let i = 0; i < 70; i++) {
  const t = START + 0.03 + ((1 - START - 0.06) * i) / 69;
  const lean = 0.05 + 0.012 * wobble(i);
  const tt = Math.min(0.995, t + lean);
  BARBS_UP.push(`M${fmt(at(t, 0.5))} L${fmt(at(tt, upper(tt) * (0.94 + 0.05 * wobble(i + 3))))}`);
  const l = t + 0.004;
  const ll = Math.min(0.995, l + lean * 0.9);
  BARBS_LOW.push(`M${fmt(at(l, -0.5))} L${fmt(at(ll, -lower(ll) * (0.94 + 0.05 * wobble(i + 7))))}`);
}

/**
 * A writing quill: a long black feather with a blue-grey sheen, a cream hollow quill at the base and a cut, inked nib.
 * Vector art built from the shaft curve above (no image file). Black was chosen for contrast on the pale page and
 * because it is what a real writing quill (goose or raven) looks like.
 */
export function Quill({ writing }: { writing: boolean }) {
  return (
    <svg
      className="quill block h-auto w-full overflow-visible"
      data-writing={writing}
      viewBox={`0 0 ${QUILL_VIEWBOX.w} ${QUILL_VIEWBOX.h}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="quill-vane" x1="30" y1="62" x2="166" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a434e" />
          <stop offset="0.5" stopColor="#1b222a" />
          <stop offset="1" stopColor="#0a0e13" />
        </linearGradient>
        <linearGradient id="quill-sheen" x1="30" y1="62" x2="166" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9fb4c8" stopOpacity="0" />
          <stop offset="0.45" stopColor="#9fb4c8" stopOpacity="0.32" />
          <stop offset="1" stopColor="#9fb4c8" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="quill-calamus" x1="4" y1="68" x2="40" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#efe3c6" />
          <stop offset="1" stopColor="#cdb98f" />
        </linearGradient>
      </defs>

      {/* the vane: broad side, narrow side, then a sheen along the broad side */}
      <path d={UPPER_VANE} fill="url(#quill-vane)" />
      <path d={LOWER_VANE} fill="url(#quill-vane)" opacity="0.88" />
      <path d={SHEEN} fill="url(#quill-sheen)" />
      <path d={BARBS_UP.join(" ")} stroke="#c8d6e4" strokeOpacity="0.2" strokeWidth="0.5" strokeLinecap="round" />
      <path d={BARBS_LOW.join(" ")} stroke="#c8d6e4" strokeOpacity="0.12" strokeWidth="0.5" strokeLinecap="round" />

      {/* shaft over the vane, with the hollow quill in front of it */}
      <path d={SHAFT} stroke="#d9ccb0" strokeOpacity="0.55" strokeWidth="1.1" strokeLinecap="round" />
      <path d={CALAMUS} stroke="#a8946c" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={CALAMUS} stroke="url(#quill-calamus)" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d={CALAMUS} stroke="#fff" strokeOpacity="0.4" strokeWidth="0.7" strokeLinecap="round" transform="translate(-0.5 -0.9)" />

      {/* the cut nib, wet with ink */}
      <path d="M4 68 L11.5 63.2 L12.8 66.2 Z" fill="#1a130d" />
      <circle cx="4.6" cy="68" r="1.2" fill="#0d1a38" />
    </svg>
  );
}
