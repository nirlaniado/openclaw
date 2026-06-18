import { SummaryRangePanel } from "@/components/summary/summary-range-panel";
import { requireUser } from "@/server/services/auth-service";
import { addDays, formatDateInTimeZone, endOfMonth, startOfMonth } from "@/server/services/date-utils";
import { getOrCreateProfile } from "@/server/services/profile-service";
import { getMonthlySummary } from "@/server/services/summary-service";
import Link from "next/link";

type MonthlySummaryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MonthlySummaryPage({ searchParams }: MonthlySummaryPageProps) {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const date = typeof resolvedSearchParams?.date === "string" ? resolvedSearchParams.date : formatDateInTimeZone(new Date(), profile.timezone);
  const summary = await getMonthlySummary(user, date);
  const monthStart = startOfMonth(date);
  const prevMonthDate = addDays(monthStart, -1);
  const nextMonthDate = addDays(endOfMonth(date), 1);

  return (
    <main className="shell page-shell">
      <section className="summary-strip" style={{ marginBottom: 24 }}>
        <div className="date-nav">
          <div className="stack-sm">
            <p className="eyebrow">Monthly summary</p>
            <h2>See the whole month as persisted daily snapshots.</h2>
          </div>
          <div className="button-row">
            <Link href={`/summary/monthly?date=${prevMonthDate}`} className="button-secondary">
              Previous month
            </Link>
            <Link href={`/summary/monthly?date=${formatDateInTimeZone(new Date(), profile.timezone)}`} className="button-secondary">
              Current month
            </Link>
            <Link href={`/summary/monthly?date=${nextMonthDate}`} className="button-secondary">
              Next month
            </Link>
          </div>
        </div>
      </section>
      <SummaryRangePanel
        title="Monthly Summary"
        description="Monthly views aggregate the same daily summary records, which keeps reads cheap and historical targets stable."
        summary={summary}
        emptyCopy="No logged meals for this month yet. Daily summaries will appear here after the first meal is saved."
      />
    </main>
  );
}
