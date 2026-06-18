"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await supabase.auth.signOut();
          router.replace("/login");
          router.refresh();
        });
      }}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: "1px solid var(--line)",
        background: "transparent",
        color: "inherit",
        cursor: isPending ? "progress" : "pointer"
      }}
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
