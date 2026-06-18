import { ProfileForm } from "@/components/profile/profile-form";
import { requireUser } from "@/server/services/auth-service";
import { getOrCreateProfile } from "@/server/services/profile-service";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user);

  return (
    <main className="shell page-shell">
      <section className="split-panel">
        <div className="card panel stack-lg">
          <div className="panel-header">
            <p className="eyebrow">Profile setup</p>
            <h1>{profile.isComplete ? "Keep your profile current" : "Finish your baseline profile"}</h1>
            <p>
              Weight, height, age, sex, timezone, and preferred units drive every later nutrition
              screen. This page writes through the profile service, not directly from UI to raw tables.
            </p>
          </div>
          <ProfileForm profile={profile} />
        </div>

        <aside className="stack-md">
          <section className="summary-strip">
            <p className="eyebrow">Current status</p>
            <h2>{profile.isComplete ? "Ready for daily logging" : "Needs a few more details"}</h2>
            <div className="inline-meta">
              <span className="metric-pill">{profile.preferredUnits} units</span>
              <span className="metric-pill">{profile.timezone}</span>
            </div>
          </section>
          <section className="card detail-card stack-sm">
            <strong>Why this matters</strong>
            <p className="muted">
              Timezone affects summary dates. Units and body metrics are the groundwork for future coaching and intake
              analysis layers.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
