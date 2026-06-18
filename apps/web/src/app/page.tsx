import Link from "next/link";
import type { Route } from "next";

const routes = [
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/goals", label: "Goals" },
  { href: "/meals/new", label: "Log Meal" }
] satisfies Array<{ href: Route; label: string }>;

export default function HomePage() {
  return (
    <main className="shell page-shell">
      <section className="page-hero">
        <div className="landing-grid">
          <div className="stack-lg">
            <div className="stack-md">
              <p className="eyebrow">Nutrition workflow, not a mock</p>
              <h1 style={{ fontSize: "clamp(2.7rem, 7vw, 5.3rem)", maxWidth: 780 }}>
                Track meals, targets, and weekly progress on the real app routes.
              </h1>
              <p style={{ maxWidth: 720, fontSize: "1.08rem", lineHeight: 1.7, color: "rgba(255, 249, 242, 0.88)" }}>
                This web app already talks to the current profile, goals, meals, and summary services in the repo.
                The frontend now centers the usable daily flow instead of a placeholder shell.
              </p>
            </div>
            <div className="button-row">
              {routes.map((route) => (
                <Link key={route.href} href={route.href} className={route.href === "/dashboard" ? "button" : "button-ghost"}>
                  {route.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="landing-stats">
            <div className="hero-chip">
              <strong>Current slices</strong>
              <p>Profile setup, goals versioning, meal logging, daily dashboard, weekly summary, monthly summary.</p>
            </div>
            <div className="hero-chip">
              <strong>Backend shape</strong>
              <p>Supabase auth and persistence, USDA-backed meal resolution, deterministic summary math.</p>
            </div>
            <div className="hero-chip">
              <strong>Pre-VM assumptions</strong>
              <p>First-match USDA resolution, fallback food catalog, advisory future LLM parser, no review queue yet.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-grid" style={{ marginTop: 24 }}>
        <div className="feature-grid">
          <article className="card feature-card">
            <p className="eyebrow">Daily flow</p>
            <h3>Log a meal and watch summary math update.</h3>
            <p className="muted">
              The dashboard and summaries are driven by stored meals and recomputed day snapshots, not fabricated frontend totals.
            </p>
          </article>
          <article className="card feature-card">
            <p className="eyebrow">Goal history</p>
            <h3>Keep goal changes historically correct.</h3>
            <p className="muted">
              Targets are versioned so weekly and monthly adherence can remain accurate as goals evolve.
            </p>
          </article>
          <article className="card feature-card">
            <p className="eyebrow">Current gaps</p>
            <h3>Real working frontend, still pre-review and pre-VM.</h3>
            <p className="muted">
              Meal correction, richer USDA choice handling, and end-to-end production infrastructure are still to come.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
