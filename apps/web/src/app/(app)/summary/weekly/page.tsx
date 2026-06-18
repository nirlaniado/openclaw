import { SummaryRangePanel } from "@/components/summary/summary-range-panel";
import { requireUser } from "@/server/services/auth-service";
import { getOrCreateProfile } from "@/server/services/profile-service";
import { getWeeklySummary } from "@/server/services/summary-service";
import { formatDateInTimeZone } from "@/server/services/date-utils";

export default async function WeeklySummaryPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user);
  const summary = await getWeeklySummary(user, formatDateInTimeZone(new Date(), profile.timezone));

  return (
    <main className="shell" style={{ padding: "48px 0" }}>
      <SummaryRangePanel
        title="Weekly Summary"
        description="Weekly rollups come from persisted daily summaries instead of resumming raw meal rows at page load."
        summary={summary}
        emptyCopy="No logged meals for this week yet. Add meals from the logging screen to populate the summary."
      />
    </main>
  );
}
