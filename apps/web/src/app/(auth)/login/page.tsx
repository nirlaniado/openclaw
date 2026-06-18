import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { env } from "@/lib/config/env";
import { getCurrentUser } from "@/server/services/auth-service";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorParam = resolvedSearchParams?.error;
  const errorMessage = typeof errorParam === "string" ? errorParam : undefined;

  return (
    <main className="shell page-shell">
      <section className="page-hero" style={{ maxWidth: 960, marginBottom: 24 }}>
        <p className="eyebrow">Magic link sign in</p>
        <h1 style={{ fontSize: "clamp(2.3rem, 6vw, 4rem)", maxWidth: 640 }}>
          Pick up your nutrition dashboard from any device.
        </h1>
        <p style={{ maxWidth: 620, color: "rgba(255, 249, 242, 0.9)", lineHeight: 1.65 }}>
          Sign in with email, complete your profile, set goals, and start logging meals. The app is wired to the
          current Supabase auth and backend routes already present in this repo.
        </p>
      </section>

      <section className="card panel" style={{ maxWidth: 620 }}>
        <div className="panel-header">
          <h1>Login</h1>
          <p>Use the same email flow the app expects in production. The link returns you straight to the dashboard.</p>
        </div>
        <LoginForm appUrl={env.NEXT_PUBLIC_SITE_URL} errorMessage={errorMessage} />
      </section>
    </main>
  );
}
