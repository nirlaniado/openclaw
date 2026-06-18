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
    <main className="shell" style={{ padding: "56px 0 80px" }}>
      <section className="card" style={{ padding: 32 }}>
        <p style={{ color: "var(--warm)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Pre-VM foundation
        </p>
        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.8rem)", margin: "12px 0 20px" }}>
          Nutrition tracker architecture and app shell.
        </h1>
        <p style={{ maxWidth: 720, color: "var(--muted)", fontSize: "1.1rem", lineHeight: 1.6 }}>
          This kickoff focuses on portable app structure, Supabase-backed auth and data boundaries,
          USDA nutrition lookup, and a stubbed LLM adapter interface for a later Oracle VM phase.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              style={{
                padding: "12px 18px",
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: route.href === "/dashboard" ? "var(--accent)" : "transparent",
                color: route.href === "/dashboard" ? "#fff" : "inherit"
              }}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
