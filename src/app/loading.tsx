import { AppFrame } from "@/ui/AppFrame";
import { HubLoading } from "@/ui/AppLoading";

/** Shown at once while this section's page loads — see `AppLoading`. */
export default function Loading() {
  return (
    <AppFrame user={null} scene="home" alignTop>
      <HubLoading />
    </AppFrame>
  );
}
