/**
 * The entry screen's "concealed book" visual (and Branch A's own echo of it): a closed book, unidentifiable on
 * purpose, with a wax-seal ribbon standing in for "you'll find out later." Same flat vector language as
 * EmptyShelf, in the page's own candlelit palette (`--scene-*`) rather than the shelf's cool pastels.
 */
export function SealedBook() {
  return (
    <svg viewBox="0 0 240 200" className="mx-auto h-auto w-full max-w-[12rem]" fill="none" aria-hidden="true">
      <ellipse cx="120" cy="177" rx="76" ry="8" fill="#000" opacity="0.18" />

      <g transform="rotate(-4 120 110)">
        <rect x="70" y="44" width="100" height="132" rx="6" fill="var(--scene-espresso-2)" />
        <rect x="70" y="44" width="14" height="132" rx="6" fill="var(--scene-espresso)" />
        <rect x="70" y="44" width="100" height="6" rx="3" fill="#fff" opacity="0.08" />
      </g>

      <rect x="58" y="101" width="122" height="15" fill="var(--scene-candle)" opacity="0.9" transform="rotate(-4 120 108)" />
      <circle cx="119" cy="109" r="19" fill="var(--scene-candle)" transform="rotate(-4 120 108)" />
      <text x="119" y="117" textAnchor="middle" fontSize="20" fontStyle="italic" style={{ fontFamily: "var(--f-display)" }} fill="var(--scene-espresso)">
        ?
      </text>

      <circle cx="196" cy="46" r="3" fill="var(--scene-candle)" opacity="0.65" />
      <circle cx="44" cy="66" r="2.2" fill="var(--scene-candle)" opacity="0.45" />
      <circle cx="184" cy="150" r="2.2" fill="var(--scene-candle)" opacity="0.45" />
    </svg>
  );
}
