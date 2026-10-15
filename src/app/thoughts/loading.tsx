import { AppFrame } from "@/ui/AppFrame";
import { BookPagesLoading } from "@/ui/AppLoading";

/** Shown at once while this section's page loads — see `AppLoading`. */
export default function Loading() {
  return (
    <AppFrame user={null} scene="thoughts" alignTop>
      <BookPagesLoading />
    </AppFrame>
  );
}
