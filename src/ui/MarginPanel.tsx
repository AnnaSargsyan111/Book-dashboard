import { Logo } from "./Logo";
import { PanelScene } from "./PanelScene";

/**
 * The brand moment on the auth screens (desktop only; on mobile the form stays front and centre). The picture depends
 * on the screen (see PanelScene). Purely decorative, so hidden from assistive technology.
 */
export function MarginPanel() {
  return (
    <aside aria-hidden="true" className="cloth sticky top-0 hidden h-dvh flex-col justify-between self-start overflow-hidden p-12 text-cloth-ink lg:flex xl:p-16">
      <Logo />
      <PanelScene />
      <div />
    </aside>
  );
}
