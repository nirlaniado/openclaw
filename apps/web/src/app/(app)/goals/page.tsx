import { GoalsForm } from "@/frontend/components/goals/goals-form";
import { requireUser } from "@/backend/services/auth-service";
import { getLatestGoalSet } from "@/backend/services/goals-service";

export default async function GoalsPage() {
  const user = await requireUser();
  const goalSet = await getLatestGoalSet(user);

  return (
    <main className="shell page-shell">
      <section className="split-panel">
        <div className="card panel stack-lg">
          <div className="panel-header">
            <p className="eyebrow">Goals setup</p>
            <h1>{goalSet ? "Adjust the active nutrition target" : "Create your first active goal set"}</h1>
            <p>
              Daily calories, protein, carbs, and fat targets are versioned so historical summaries stay correct even
              after changes.
            </p>
          </div>
          <GoalsForm goalSet={goalSet} />
        </div>

        <aside className="stack-md">
          <section className="summary-strip">
            <p className="eyebrow">Active target</p>
            <h2>{goalSet ? `${goalSet.calorieTarget} kcal` : "No active goal yet"}</h2>
            {goalSet ? (
              <div className="stack-sm">
                <p className="muted">{goalSet.proteinGramsTarget}g protein</p>
                <p className="muted">{goalSet.carbsGramsTarget}g carbs</p>
                <p className="muted">{goalSet.fatGramsTarget}g fat</p>
              </div>
            ) : (
              <p className="muted">Set a target before using adherence percentages on the dashboard and summary screens.</p>
            )}
          </section>
          <section className="card detail-card stack-sm">
            <strong>Versioning behavior</strong>
            <p className="muted">
              Editing the same effective date updates the current record. Picking a new effective date closes the old
              target and starts a new history window.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
