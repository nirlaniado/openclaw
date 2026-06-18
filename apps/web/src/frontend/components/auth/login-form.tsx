"use client";

import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/frontend/lib/supabase-client";

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
      className="form-shell"
      style={{ marginTop: 24 }}
    >
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="field-control"
        />
      </label>
      <button type="submit" disabled={isPending} className="button" style={{ cursor: isPending ? "progress" : "pointer" }}>
        {isPending ? "Sending..." : "Send magic link"}
      </button>
      {notice ? <p className="success-note" style={{ margin: 0 }}>{notice}</p> : null}
      {error ? <p className="error-note" style={{ margin: 0 }}>{error}</p> : null}
    </form>
  );
}
