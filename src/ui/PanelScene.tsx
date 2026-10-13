"use client";

import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/routes";
import { LettersScene } from "./scenes/LettersScene";
import { PagesScene } from "./scenes/PagesScene";
import { StackScene } from "./scenes/StackScene";
import { WritingSheet } from "./WritingSheet";

/**
 * Chooses the picture for the brand panel from the current route. The panel itself persists across auth screens, so
 * moving between them simply swaps the scene (with a soft fade):
 *  - Log in            an open book with letters rising from it
 *  - Forgot password   the book stack, pages turning
 *  - Onboarding        pastel books stacking one by one, with quotes about reading
 *  - everything else   the quill writing on the manuscript page
 */
export function PanelScene() {
  const pathname = usePathname();
  const scene = pathname.startsWith(ROUTES.login)
    ? "letters"
    : pathname.startsWith(ROUTES.forgotPassword)
      ? "pages"
      : pathname.startsWith(ROUTES.onboarding)
        ? "stack"
        : "writing";

  return (
    <div key={scene} className="animate-fade w-full">
      {scene === "letters" ? <LettersScene /> : scene === "pages" ? <PagesScene /> : scene === "stack" ? <StackScene /> : <WritingSheet />}
    </div>
  );
}
