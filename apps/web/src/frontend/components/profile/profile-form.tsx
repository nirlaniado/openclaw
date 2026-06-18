"use client";

import { useState, useTransition } from "react";
import type { ProfileRecord } from "@/backend/contracts/profile";

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
      className="form-shell"
      style={{ marginTop: 24 }}
    >
      <div className="field-grid">
        <label className="field">
          <span>Display name</span>
          <input
            value={form.displayName}
            onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            required
            className="field-control"
          />
        </label>
        <label className="field">
          <span>Age</span>
          <input
            type="number"
            min={13}
            max={120}
            value={form.age}
            onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
            required
            className="field-control"
          />
        </label>
        <label className="field">
          <span>Sex</span>
          <select
            value={form.sex}
            onChange={(event) => setForm((current) => ({ ...current, sex: event.target.value as typeof current.sex }))}
            className="field-control"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
        <label className="field">
          <span>Height (cm)</span>
          <input
            type="number"
            min={1}
            step="0.1"
            value={form.heightCm}
            onChange={(event) => setForm((current) => ({ ...current, heightCm: event.target.value }))}
            required
            className="field-control"
          />
        </label>
        <label className="field">
          <span>Weight (kg)</span>
          <input
            type="number"
            min={1}
            step="0.1"
            value={form.weightKg}
            onChange={(event) => setForm((current) => ({ ...current, weightKg: event.target.value }))}
            required
            className="field-control"
          />
        </label>
        <label className="field">
          <span>Timezone</span>
          <input
            value={form.timezone}
            onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
            required
            className="field-control"
          />
        </label>
        <label className="field">
          <span>Preferred units</span>
          <select
            value={form.preferredUnits}
            onChange={(event) =>
              setForm((current) => ({ ...current, preferredUnits: event.target.value as typeof current.preferredUnits }))
            }
            className="field-control"
          >
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
          </select>
        </label>
      </div>
      <button type="submit" disabled={isPending} className="button">
        {isPending ? "Saving..." : "Save profile"}
      </button>
      {message ? <p className="success-note" style={{ margin: 0 }}>{message}</p> : null}
      {error ? <p className="error-note" style={{ margin: 0 }}>{error}</p> : null}
    </form>
  );
}
