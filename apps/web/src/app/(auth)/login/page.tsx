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
    <main className="shell" style={{ padding: "48px 0" }}>
      <section className="card" style={{ padding: 24, maxWidth: 560 }}>
        <h1>Login</h1>
        <p style={{ color: "var(--muted)" }}>
          Supabase Auth entry point. Sprint 1 should support email magic link or OTP first.
        </p>
        <LoginForm appUrl={env.NEXT_PUBLIC_SITE_URL} errorMessage={errorMessage} />
      </section>
    </main>
  );
}
