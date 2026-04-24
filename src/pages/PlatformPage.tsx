import { OrganizationLanding } from "../components/dashboard/OrganizationLanding";
import type { DashboardSnapshot, ReMorphEvent, WorkflowEpisode } from "../types/remorph";

export function PlatformPage({
  snapshot,
  event,
  workflow,
  onEnterDashboard,
  hideHeader = false,
}: {
  snapshot: DashboardSnapshot | null;
  event: ReMorphEvent | null;
  workflow: WorkflowEpisode | null;
  onEnterDashboard: () => void;
  hideHeader?: boolean;
}) {
  return (
    <OrganizationLanding
      snapshot={snapshot}
      event={event}
      workflow={workflow}
      onEnterDashboard={onEnterDashboard}
      hideHeader={hideHeader}
    />
  );
}
