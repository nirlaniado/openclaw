import { MealForm } from "@/frontend/components/meals/meal-form";
import { requireUser } from "@/backend/services/auth-service";
import { getOrCreateProfile } from "@/backend/services/profile-service";
import { buildMealFormDefaults } from "@/backend/services/meal-log-service";

export default async function NewMealPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user);

  return (
    <main className="shell page-shell">
      <section className="split-panel">
        <div className="card panel stack-lg">
          <div className="panel-header">
            <p className="eyebrow">Meal logging</p>
            <h1>Describe what you ate in plain language.</h1>
            <p>
              The backend parses the text, resolves foods through USDA-backed lookup, stores the meal,
              and recomputes the daily summary. The future LLM parser remains advisory only.
            </p>
          </div>
          <MealForm defaults={buildMealFormDefaults(profile.timezone)} />
        </div>

        <aside className="stack-md">
          <section className="summary-strip">
            <p className="eyebrow">Input tips</p>
            <h2>Best results come from a few simple habits.</h2>
            <div className="stack-sm">
              <p className="muted">Include rough counts like “2 eggs” or “1 cup rice” when you have them.</p>
              <p className="muted">Separate distinct foods with commas or “and”.</p>
              <p className="muted">Timezone defaults to your profile so the meal lands on the right summary day.</p>
            </div>
          </section>
          <section className="card detail-card stack-sm">
            <strong>Current pre-VM gap</strong>
            <p className="muted">
              The frontend shows the saved first-pass resolution immediately. A dedicated review-and-correct step is
              still a later slice.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
