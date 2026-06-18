import { MealForm } from "@/components/meals/meal-form";
import { requireUser } from "@/server/services/auth-service";
import { getOrCreateProfile } from "@/server/services/profile-service";
import { buildMealFormDefaults } from "@/server/services/meal-log-service";

export default async function NewMealPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user);

  return (
    <main className="shell" style={{ padding: "48px 0" }}>
      <section className="card" style={{ padding: 24 }}>
        <h1>Log Meal</h1>
        <p style={{ color: "var(--muted)" }}>
          Start with manual meal text. The backend uses deterministic parsing and USDA-backed food
          matching, while the future LLM adapter stays advisory only.
        </p>
        <MealForm defaults={buildMealFormDefaults(profile.timezone)} />
      </section>
    </main>
  );
}
