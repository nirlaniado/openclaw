import { SummaryRangePanel } from "@/components/summary/summary-range-panel";
import { requireUser } from "@/server/services/auth-service";
import { formatDateInTimeZone } from "@/server/services/date-utils";
import { getOrCreateProfile } from "@/server/services/profile-service";
import { getMonthlySummary } from "@/server/services/summary-service";

export default async function MonthlySummaryPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user);
  const summary = await getMonthlySummary(user, formatDateInTimeZone(new Date(), profile.timezone));

  return (
    <main className="shell" style={{ padding: "48px 0" }}>
      <SummaryRangePanel
        title="Monthly Summary"
        description="Monthly views aggregate the same daily summary records, which keeps reads cheap and historical targets stable."
        summary={summary}
        emptyCopy="No logged meals for this month yet. Daily summaries will appear here after the first meal is saved."
      />
    </main>
  );
}
