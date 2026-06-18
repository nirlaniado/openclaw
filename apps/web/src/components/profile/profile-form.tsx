"use client";

import { useState, useTransition } from "react";
import type { ProfileRecord } from "@/server/contracts/profile";

type ProfileFormProps = {
  profile: ProfileRecord;
};

function toNumber(value: string) {
  return Number.parseFloat(value);
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [form, setForm] = useState({
    displayName: profile.displayName ?? "",
    age: profile.age?.toString() ?? "",
    sex: profile.sex ?? "prefer_not_to_say",
    heightCm: profile.heightCm?.toString() ?? "",
    weightKg: profile.weightKg?.toString() ?? "",
    timezone: profile.timezone,
    preferredUnits: profile.preferredUnits
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        setError(null);

        startTransition(async () => {
          const response = await fetch("/api/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              displayName: form.displayName,
              age: Number.parseInt(form.age, 10),
              sex: form.sex,
              heightCm: toNumber(form.heightCm),
              weightKg: toNumber(form.weightKg),
              timezone: form.timezone,
              preferredUnits: form.preferredUnits
            })
          });

          const result = (await response.json()) as { profile?: ProfileRecord; error?: string };

          if (!response.ok || !result.profile) {
            setError(result.error ?? "Unable to save profile.");
            return;
          }

          setForm({
            displayName: result.profile.displayName ?? "",
            age: result.profile.age?.toString() ?? "",
            sex: result.profile.sex ?? "prefer_not_to_say",
            heightCm: result.profile.heightCm?.toString() ?? "",
            weightKg: result.profile.weightKg?.toString() ?? "",
            timezone: result.profile.timezone,
            preferredUnits: result.profile.preferredUnits
          });
          setMessage("Profile saved.");
        });
      }}
      style={{ display: "grid", gap: 16, marginTop: 24 }}
    >
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Display name</span>
          <input
            value={form.displayName}
            onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            required
            style={fieldStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Age</span>
          <input
            type="number"
            min={13}
            max={120}
            value={form.age}
            onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
            required
            style={fieldStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Sex</span>
          <select
            value={form.sex}
            onChange={(event) => setForm((current) => ({ ...current, sex: event.target.value as typeof current.sex }))}
            style={fieldStyle}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Height (cm)</span>
          <input
            type="number"
            min={1}
            step="0.1"
            value={form.heightCm}
            onChange={(event) => setForm((current) => ({ ...current, heightCm: event.target.value }))}
            required
            style={fieldStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Weight (kg)</span>
          <input
            type="number"
            min={1}
            step="0.1"
            value={form.weightKg}
            onChange={(event) => setForm((current) => ({ ...current, weightKg: event.target.value }))}
            required
            style={fieldStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Timezone</span>
          <input
            value={form.timezone}
            onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
            required
            style={fieldStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Preferred units</span>
          <select
            value={form.preferredUnits}
            onChange={(event) =>
              setForm((current) => ({ ...current, preferredUnits: event.target.value as typeof current.preferredUnits }))
            }
            style={fieldStyle}
          >
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
          </select>
        </label>
      </div>
      <button type="submit" disabled={isPending} style={buttonStyle}>
        {isPending ? "Saving..." : "Save profile"}
      </button>
      {message ? <p style={{ margin: 0, color: "var(--accent-strong)" }}>{message}</p> : null}
      {error ? <p style={{ margin: 0, color: "#9f2d21" }}>{error}</p> : null}
    </form>
  );
}

const fieldStyle = {
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,0.8)",
  font: "inherit"
} as const;

const buttonStyle = {
  padding: "14px 18px",
  borderRadius: 999,
  border: 0,
  background: "var(--accent)",
  color: "#fff",
  font: "inherit",
  cursor: "pointer"
} as const;
