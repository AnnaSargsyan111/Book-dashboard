import { AppFrame } from "@/ui/AppFrame";
import { HubLoading } from "@/ui/AppLoading";
import { HubEntrance } from "@/ui/HubEntrance";

/**
 * Shown at once while the hub page is built. Right after logging in (or signing up, or finishing onboarding) that
 * is the closed book — exactly what the hub's own `BookIntro` continues from — rather than an in-between page;
 * any other visit gets the usual skeleton. See `HubEntrance` for how the two are told apart.
 */
export default function Loading() {
  return (
    <HubEntrance
      fallback={
        <AppFrame user={null} scene="home" alignTop>
          <HubLoading />
        </AppFrame>
      }
    />
  );
}
