import { GoalsForm } from "@/components/goals/goals-form";
import { requireUser } from "@/server/services/auth-service";
import { getLatestGoalSet } from "@/server/services/goals-service";

export default async function GoalsPage() {
  const user = await requireUser();
  const goalSet = await getLatestGoalSet(user);

  return (
    <main className="shell" style={{ padding: "48px 0" }}>
      <section className="card" style={{ padding: 24 }}>
        <h1>Goals Setup</h1>
        <p style={{ color: "var(--muted)" }}>
          Daily calories, protein, carbs, and fat targets belong to a goals version table so
          summaries stay historically correct.
        </p>
        <GoalsForm goalSet={goalSet} />
      </section>
    </main>
  );
}
