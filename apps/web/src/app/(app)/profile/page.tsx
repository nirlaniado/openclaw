import { ProfileForm } from "@/components/profile/profile-form";
import { requireUser } from "@/server/services/auth-service";
import { getOrCreateProfile } from "@/server/services/profile-service";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user);

  return (
    <main className="shell" style={{ padding: "48px 0" }}>
      <section className="card" style={{ padding: 24 }}>
        <h1>Profile Setup</h1>
        <p style={{ color: "var(--muted)" }}>
          Collect weight, height, age, sex, timezone, and preferred units. Persist through the
          profile service rather than directly from UI to Supabase.
        </p>
        <ProfileForm profile={profile} />
      </section>
    </main>
  );
}
