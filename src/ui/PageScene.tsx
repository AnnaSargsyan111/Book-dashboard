export type PageSceneKey = "home" | "aboutMe" | "books" | "mysteryBook" | "thoughts" | "settings";

/**
 * The warm, book-themed backdrop behind a signed-in page: same materials and motion language everywhere, a
 * different tonal wash per section (see the `[data-scene]` rules in globals.css). Purely decorative — fixed
 * behind the header and content, `aria-hidden`, never in the tab order. `"home"` is the app's own hub page
 * (`MystBookLanding`), not one of the five sections — it gets the calmest wash, closest in spirit to Settings',
 * since its own hero photo and chapter spread already carry the page's visual interest.
 *
 * Each section used to also draw a small illustrated corner motif here (a shelf of spines, a candle and book, a
 * pen, an arch) to gesture at its own mood. Now that every section's hero band and sidebar foot carry a real
 * photograph of that same mood, those flat vector icons would only re-draw — more faintly and less
 * convincingly — what the photo already says, and the two together read as two competing decorative systems
 * rather than one. They've been retired; the soft tonal wash stays, since it's ambient atmosphere rather than a
 * competing illustration. Thoughts keeps its ruled-paper texture for the same reason: it's an abstract material
 * (the same ruled lines the auth page uses), not a figurative motif duplicating the photo.
 */
export function PageScene({ scene }: { scene: PageSceneKey }) {
  return (
    <div className="page-scene" data-scene={scene} aria-hidden="true">
      <div className="page-scene-wash" />
      {scene === "thoughts" && <div className="page-scene-rules" />}
    </div>
  );
}
