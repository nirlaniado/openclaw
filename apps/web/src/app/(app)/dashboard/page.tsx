import Link from "next/link";
import { requireUser } from "@/server/services/auth-service";
import { getLatestGoalSet } from "@/server/services/goals-service";
import { getOrCreateProfile } from "@/server/services/profile-service";
import { getTodaySummary } from "@/server/services/summary-service";
import { listRecentMeals } from "@/server/services/meal-log-service";

export default async function DashboardPage() {
  const user = await requireUser();
  const [profile, goalSet] = await Promise.all([getOrCreateProfile(user), getLatestGoalSet(user)]);
  const [summary, recentMeals] = await Promise.all([getTodaySummary(user, profile.timezone), listRecentMeals(user)]);

  return (
    <main className="shell" style={{ padding: "48px 0" }}>
      <section className="card" style={{ padding: 24, display: "grid", gap: 24 }}>
        <h1>Daily Dashboard</h1>
        <p style={{ color: "var(--muted)" }}>
          Today&apos;s dashboard is now backed by persisted meals and daily summary aggregation. Weekly
          and monthly routes read the same daily summary layer.
        </p>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div style={{ padding: 18, borderRadius: 16, border: "1px solid var(--line)" }}>
            <h2 style={{ marginTop: 0 }}>Auth status</h2>
            <p style={{ marginBottom: 0, color: "var(--muted)" }}>{user.email}</p>
          </div>
          <div style={{ padding: 18, borderRadius: 16, border: "1px solid var(--line)" }}>
            <h2 style={{ marginTop: 0 }}>Profile</h2>
            <p style={{ marginBottom: 0, color: "var(--muted)" }}>
              {profile.isComplete ? "Profile complete" : "Profile setup still required"}
            </p>
          </div>
          <div style={{ padding: 18, borderRadius: 16, border: "1px solid var(--line)" }}>
            <h2 style={{ marginTop: 0 }}>Goals</h2>
            <p style={{ marginBottom: 0, color: "var(--muted)" }}>
              {goalSet
                ? `${goalSet.calorieTarget} kcal, ${goalSet.proteinGramsTarget}g protein`
                : "No active goals yet"}
            </p>
          </div>
          <div style={{ padding: 18, borderRadius: 16, border: "1px solid var(--line)" }}>
            <h2 style={{ marginTop: 0 }}>Today</h2>
            <p style={{ marginBottom: 0, color: "var(--muted)" }}>
              {summary.consumed.calories} / {summary.target.calories || 0} kcal
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/profile" style={ctaStyle}>
            Complete profile
          </Link>
          <Link href="/goals" style={ctaStyle}>
            Set goals
          </Link>
          <Link href="/meals/new" style={ctaStyle}>
            Log meal
          </Link>
          <Link href="/summary/weekly" style={secondaryCtaStyle}>
            Weekly view
          </Link>
          <Link href="/summary/monthly" style={secondaryCtaStyle}>
            Monthly view
          </Link>
        </div>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <MetricCard label="Meals today" value={summary.mealCount.toString()} />
          <MetricCard label="Protein" value={`${summary.consumed.proteinGrams}/${summary.target.proteinGrams || 0} g`} />
          <MetricCard label="Carbs" value={`${summary.consumed.carbsGrams}/${summary.target.carbsGrams || 0} g`} />
          <MetricCard label="Fat" value={`${summary.consumed.fatGrams}/${summary.target.fatGrams || 0} g`} />
        </div>

        <section style={{ display: "grid", gap: 16 }}>
          <div>
            <h2 style={{ marginBottom: 6 }}>Recent meals</h2>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Empty state and parser/lookup failures stay explicit here so the logging flow is easy to debug.
            </p>
          </div>
          {recentMeals.length > 0 ? (
            recentMeals.map((meal) => (
              <article
                key={meal.id}
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 18,
                  borderRadius: 16,
                  border: "1px solid var(--line)",
                  background: "rgba(255,255,255,0.72)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{meal.mealType}</strong>
                  <span style={{ color: "var(--muted)" }}>{new Date(meal.eatenAt).toLocaleString()}</span>
                </div>
                <p style={{ margin: 0, color: "var(--muted)" }}>{meal.mealText}</p>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {meal.items.reduce((sum, item) => sum + item.calories, 0)} kcal across {meal.items.length} items
                </p>
              </article>
            ))
          ) : (
            <div style={emptyStateStyle}>
              No meals logged yet. Start with a plain-language entry like `2 eggs, yogurt, banana` and the backend
              will resolve USDA matches before saving.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

const ctaStyle = {
  padding: "12px 18px",
  borderRadius: 999,
  border: "1px solid var(--line)",
  background: "var(--accent)",
  color: "#fff"
} as const;

const secondaryCtaStyle = {
  padding: "12px 18px",
  borderRadius: 999,
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,0.72)"
} as const;

const emptyStateStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px dashed var(--line)",
  color: "var(--muted)"
} as const;

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 18, borderRadius: 16, border: "1px solid var(--line)" }}>
      <p style={{ margin: 0, color: "var(--muted)" }}>{label}</p>
      <h2 style={{ marginBottom: 0 }}>{value}</h2>
    </div>
  );
}
