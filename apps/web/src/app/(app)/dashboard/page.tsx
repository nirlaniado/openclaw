import Link from "next/link";
import { requireUser } from "@/server/services/auth-service";
import { getLatestGoalSet } from "@/server/services/goals-service";
import { getOrCreateProfile } from "@/server/services/profile-service";
import { addDays, formatDateInTimeZone } from "@/server/services/date-utils";
import { listMealsForDate } from "@/server/services/meal-log-service";
import { getDailySummary } from "@/server/services/summary-service";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireUser();
  const [profile, goalSet] = await Promise.all([getOrCreateProfile(user), getLatestGoalSet(user)]);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedDate = typeof resolvedSearchParams?.date === "string" ? resolvedSearchParams.date : undefined;
  const activeDate = requestedDate ?? formatDateInTimeZone(new Date(), profile.timezone);
  const [summary, meals] = await Promise.all([getDailySummary(user, activeDate), listMealsForDate(user, activeDate, profile.timezone)]);
  const prevDate = addDays(activeDate, -1);
  const nextDate = addDays(activeDate, 1);
  const totalCalories = summary.target.calories > 0 ? Math.min(100, (summary.consumed.calories / summary.target.calories) * 100) : 0;

  return (
    <main className="shell page-shell">
      <section className="page-grid">
        <div className="page-hero">
          <div className="date-nav">
            <div className="stack-sm">
              <p className="eyebrow">Daily dashboard</p>
              <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>{activeDate}</h1>
              <p style={{ maxWidth: 680, color: "rgba(255, 249, 242, 0.9)", lineHeight: 1.65 }}>
                Move day by day through saved meals, macro totals, and setup blockers. Weekly and monthly views read the
                same persisted summary layer.
              </p>
            </div>
            <div className="button-row">
              <Link href={`/dashboard?date=${prevDate}`} className="button-ghost">
                Previous day
              </Link>
              <Link href={`/dashboard?date=${formatDateInTimeZone(new Date(), profile.timezone)}`} className="button-ghost">
                Today
              </Link>
              <Link href={`/dashboard?date=${nextDate}`} className="button-ghost">
                Next day
              </Link>
            </div>
          </div>

          <div className="hero-grid">
            <div className="hero-chip">
              <strong>Signed in</strong>
              <p>{user.email}</p>
            </div>
            <div className="hero-chip">
              <strong>Profile</strong>
              <p>{profile.isComplete ? "Complete" : "Needs completion"}</p>
            </div>
            <div className="hero-chip">
              <strong>Goal target</strong>
              <p>{goalSet ? `${goalSet.calorieTarget} kcal active` : "No active goal set"}</p>
            </div>
            <div className="hero-chip">
              <strong>Calories progress</strong>
              <p>
                {summary.consumed.calories} / {summary.target.calories || 0} kcal
              </p>
            </div>
          </div>
        </div>

        <section className="summary-strip">
          <div className="section-heading">
            <div className="stack-sm">
              <p className="eyebrow">Day progress</p>
              <h2>{summary.mealCount > 0 ? "Nutrition progress based on logged meals" : "No meals logged for this date yet"}</h2>
            </div>
            <div className="inline-meta">
              <span className="metric-pill">{summary.mealCount} meals</span>
              <span className="metric-pill">{summary.adherencePercent}% calorie adherence</span>
            </div>
          </div>
          <div className="progress-rail">
            <div className="progress-fill" style={{ width: `${totalCalories}%` }} />
          </div>
        </section>

        <div className="metrics-grid">
          <MetricCard label="Protein" value={`${summary.consumed.proteinGrams}/${summary.target.proteinGrams || 0} g`} />
          <MetricCard label="Carbs" value={`${summary.consumed.carbsGrams}/${summary.target.carbsGrams || 0} g`} />
          <MetricCard label="Fat" value={`${summary.consumed.fatGrams}/${summary.target.fatGrams || 0} g`} />
          <MetricCard label="Logged days in range" value={`${summary.loggedDayCount}/${summary.totalDayCount}`} />
        </div>

        <div className="split-panel">
          <section className="card panel stack-md">
            <div className="section-heading">
              <div className="stack-sm">
                <p className="eyebrow">Meals for {activeDate}</p>
                <h2>Actual saved entries</h2>
              </div>
              <div className="button-row">
                <Link href="/meals/new" className="button">
                  Log meal
                </Link>
                <Link href="/summary/weekly" className="button-secondary">
                  Weekly view
                </Link>
                <Link href="/summary/monthly" className="button-secondary">
                  Monthly view
                </Link>
              </div>
            </div>

            {meals.length > 0 ? (
              <div className="timeline-list">
                {meals.map((meal) => (
                  <article key={meal.id} className="timeline-item">
                    <div className="timeline-row">
                      <strong>{meal.mealType}</strong>
                      <span className="muted">{new Date(meal.eatenAt).toLocaleString()}</span>
                    </div>
                    <p className="muted" style={{ margin: 0 }}>{meal.mealText}</p>
                    <div className="stack-sm">
                      {meal.items.map((item) => (
                        <div key={item.id} className="timeline-row">
                          <span>{item.description}</span>
                          <span className="muted">
                            {item.calories} kcal, {item.proteinGrams}p / {item.carbsGrams}c / {item.fatGrams}f
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No meals logged for {activeDate}. Start with a plain-language entry like <code>2 eggs, yogurt, banana</code>
                and the backend will resolve USDA matches before saving.
              </div>
            )}
          </section>

          <aside className="stack-md">
            <section className="card panel stack-md">
              <div className="section-heading">
                <div className="stack-sm">
                  <p className="eyebrow">Setup blockers</p>
                  <h2>Keep the core flow healthy</h2>
                </div>
              </div>
              <div className="stack-sm">
                <StatusRow
                  title="Profile"
                  description={profile.isComplete ? "Profile is complete and ready for richer planning." : "Complete profile details for better future coaching layers."}
                />
                <StatusRow
                  title="Goals"
                  description={
                    goalSet
                      ? `Active from ${goalSet.effectiveFrom}.`
                      : "Set a target so adherence and summary goals become meaningful."
                  }
                />
                <StatusRow
                  title="Meals"
                  description={meals.length > 0 ? `${meals.length} meal entries logged for this date.` : "Log the first meal for this date to populate the dashboard."}
                />
              </div>
            </section>

            <section className="card panel stack-md">
              <p className="eyebrow">Summary math</p>
              <h2 style={{ margin: 0 }}>Daily total snapshot</h2>
              <p className="muted" style={{ margin: 0 }}>
                The backend recomputes this day after each save, then weekly and monthly pages aggregate those stable daily records.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatusRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="detail-card">
      <strong>{title}</strong>
      <p className="muted">{description}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <p style={{ margin: 0, color: "var(--muted)" }}>{label}</p>
      <h2 style={{ marginBottom: 0 }}>{value}</h2>
    </div>
  );
}
