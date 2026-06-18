import Link from "next/link";
import type { Route } from "next";
import { AppNav } from "@/components/app/app-nav";
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
      <header className="shell app-header">
        <div className="card app-header-card">
          <div>
            <p className="eyebrow">
              Portable nutrition tracker
            </p>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{user.email}</p>
          </div>
          <div className="nav-row">
            <AppNav links={links} />
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
