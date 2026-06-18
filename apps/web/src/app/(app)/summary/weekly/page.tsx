import { SummaryRangePanel } from "@/components/summary/summary-range-panel";
import { requireUser } from "@/server/services/auth-service";
import { addDays, formatDateInTimeZone, startOfWeek } from "@/server/services/date-utils";
import { getOrCreateProfile } from "@/server/services/profile-service";
import { getWeeklySummary } from "@/server/services/summary-service";
import Link from "next/link";

type WeeklySummaryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WeeklySummaryPage({ searchParams }: WeeklySummaryPageProps) {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const date = typeof resolvedSearchParams?.date === "string" ? resolvedSearchParams.date : formatDateInTimeZone(new Date(), profile.timezone);
  const summary = await getWeeklySummary(user, date);
  const anchor = startOfWeek(date);

  return (
    <main className="shell page-shell">
      <section className="summary-strip" style={{ marginBottom: 24 }}>
        <div className="date-nav">
          <div className="stack-sm">
            <p className="eyebrow">Weekly summary</p>
            <h2>Review one complete week at a time.</h2>
          </div>
          <div className="button-row">
            <Link href={`/summary/weekly?date=${addDays(anchor, -7)}`} className="button-secondary">
              Previous week
            </Link>
            <Link href={`/summary/weekly?date=${formatDateInTimeZone(new Date(), profile.timezone)}`} className="button-secondary">
              Current week
            </Link>
            <Link href={`/summary/weekly?date=${addDays(anchor, 7)}`} className="button-secondary">
              Next week
            </Link>
          </div>
        </div>
      </section>
      <SummaryRangePanel
        title="Weekly Summary"
        description="Weekly rollups come from persisted daily summaries instead of resumming raw meal rows at page load."
        summary={summary}
        emptyCopy="No logged meals for this week yet. Add meals from the logging screen to populate the summary."
      />
    </main>
  );
}
