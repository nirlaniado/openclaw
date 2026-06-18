import Link from "next/link";
import type { Route } from "next";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/server/services/auth-service";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/goals", label: "Goals" },
  { href: "/meals/new", label: "Meals" },
  { href: "/summary/weekly", label: "Weekly" },
  { href: "/summary/monthly", label: "Monthly" }
] satisfies Array<{ href: Route; label: string }>;

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <>
      <header className="shell" style={{ padding: "24px 0 0" }}>
        <div
          className="card"
          style={{
            padding: "18px 22px",
            display: "flex",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <div>
            <p style={{ margin: 0, color: "var(--warm)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Portable nutrition tracker
            </p>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{user.email}</p>
          </div>
          <nav style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} style={{ padding: "10px 14px" }}>
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
