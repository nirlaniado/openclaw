"use client";

import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginFormProps = {
  appUrl: string;
  errorMessage?: string;
};

export function LoginForm({ appUrl, errorMessage }: LoginFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(errorMessage ?? null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(null);
        setError(null);

        startTransition(async () => {
          const redirectTo = new URL("/auth/callback", appUrl);
          redirectTo.searchParams.set("next", "/dashboard");

          const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectTo.toString()
            }
          });

          if (authError) {
            setError(authError.message);
            return;
          }

          setNotice("Check your email for the sign-in link.");
          setEmail("");
        });
      }}
      style={{ display: "grid", gap: 16, marginTop: 24 }}
    >
      <label style={{ display: "grid", gap: 8 }}>
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid var(--line)",
            background: "rgba(255,255,255,0.8)",
            font: "inherit"
          }}
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "14px 18px",
          borderRadius: 999,
          border: 0,
          background: "var(--accent)",
          color: "#fff",
          font: "inherit",
          cursor: isPending ? "progress" : "pointer"
        }}
      >
        {isPending ? "Sending..." : "Send magic link"}
      </button>
      {notice ? <p style={{ margin: 0, color: "var(--accent-strong)" }}>{notice}</p> : null}
      {error ? <p style={{ margin: 0, color: "#9f2d21" }}>{error}</p> : null}
    </form>
  );
}
