import { AppFrame } from "@/ui/AppFrame";
import { BooksLoading } from "@/ui/AppLoading";

/** Shown at once while this section's page loads — see `AppLoading`. */
export default function Loading() {
  return (
    <AppFrame user={null} scene="books">
      <BooksLoading />
    </AppFrame>
  );
}
