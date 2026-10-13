"use client";

import { useState } from "react";
import type { SavedAddress } from "@/shared/validation/mystery";
import { MysteryBookFlow } from "./MysteryBookFlow";
import { MysteryHero } from "./MysteryHero";
import { RecentlyRecommended } from "./RecentlyRecommended";

/**
 * Composes the Mystery Book page redesign around the untouched flow: the premium hero stands in for the flow's
 * own plain entry screen (`landingContent`, passed as a function here rather than from the server page itself —
 * a function prop can't cross the server/client boundary, so this thin client wrapper is where it has to be
 * built), and "Recently Recommended" sits below it — but only there. Once the user starts answering questions
 * (any stage past "entry"), it disappears, since that's not the moment to be showing past recommendations;
 * `onEntryChange` is how a private, internal `MysteryBookFlow` state (`stage`) reaches this sibling at all.
 */
export function MysteryBookPageClient({ needsGenreStep, initialAddress }: { needsGenreStep: boolean; initialAddress: SavedAddress }) {
  const [isEntry, setIsEntry] = useState(true);
  return (
    <>
      <MysteryBookFlow
        needsGenreStep={needsGenreStep}
        initialAddress={initialAddress}
        landingContent={(start) => <MysteryHero onStart={start} />}
        onEntryChange={setIsEntry}
      />
      {isEntry ? <RecentlyRecommended /> : null}
    </>
  );
}
