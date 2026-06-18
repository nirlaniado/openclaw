"use client";

import { useState, useTransition } from "react";
import type { GoalSetRecord } from "@/server/contracts/goals";

type GoalsFormProps = {
  goalSet: GoalSetRecord | null;
};

function toNumber(value: string) {
  return Number.parseFloat(value);
}

export function GoalsForm({ goalSet }: GoalsFormProps) {
  const [form, setForm] = useState({
    calorieTarget: goalSet?.calorieTarget.toString() ?? "",
    proteinGramsTarget: goalSet?.proteinGramsTarget.toString() ?? "",
    carbsGramsTarget: goalSet?.carbsGramsTarget.toString() ?? "",
    fatGramsTarget: goalSet?.fatGramsTarget.toString() ?? "",
    effectiveFrom: goalSet?.effectiveFrom ?? new Date().toISOString().slice(0, 10)
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
          const response = await fetch("/api/goals", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              calorieTarget: Number.parseInt(form.calorieTarget, 10),
              proteinGramsTarget: toNumber(form.proteinGramsTarget),
              carbsGramsTarget: toNumber(form.carbsGramsTarget),
              fatGramsTarget: toNumber(form.fatGramsTarget),
              effectiveFrom: form.effectiveFrom
            })
          });

          const result = (await response.json()) as { goalSet?: GoalSetRecord; error?: string };

          if (!response.ok || !result.goalSet) {
            setError(result.error ?? "Unable to save goals.");
            return;
          }

          setForm({
            calorieTarget: result.goalSet.calorieTarget.toString(),
            proteinGramsTarget: result.goalSet.proteinGramsTarget.toString(),
            carbsGramsTarget: result.goalSet.carbsGramsTarget.toString(),
            fatGramsTarget: result.goalSet.fatGramsTarget.toString(),
            effectiveFrom: result.goalSet.effectiveFrom
          });
          setMessage("Goals saved.");
        });
      }}
      className="form-shell"
      style={{ marginTop: 24 }}
    >
      <div className="field-grid">
        <label className="field">
          <span>Calories target</span>
          <input
            type="number"
            min={1}
            value={form.calorieTarget}
            onChange={(event) => setForm((current) => ({ ...current, calorieTarget: event.target.value }))}
            required
            className="field-control"
          />
        </label>
        <label className="field">
          <span>Protein target (g)</span>
          <input
            type="number"
            min={1}
            step="0.1"
            value={form.proteinGramsTarget}
            onChange={(event) => setForm((current) => ({ ...current, proteinGramsTarget: event.target.value }))}
            required
            className="field-control"
          />
        </label>
        <label className="field">
          <span>Carbs target (g)</span>
          <input
            type="number"
            min={1}
            step="0.1"
            value={form.carbsGramsTarget}
            onChange={(event) => setForm((current) => ({ ...current, carbsGramsTarget: event.target.value }))}
            required
            className="field-control"
          />
        </label>
        <label className="field">
          <span>Fat target (g)</span>
          <input
            type="number"
            min={1}
            step="0.1"
            value={form.fatGramsTarget}
            onChange={(event) => setForm((current) => ({ ...current, fatGramsTarget: event.target.value }))}
            required
            className="field-control"
          />
        </label>
        <label className="field">
          <span>Effective from</span>
          <input
            type="date"
            value={form.effectiveFrom}
            onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))}
            required
            className="field-control"
          />
        </label>
      </div>
      <button type="submit" disabled={isPending} className="button">
        {isPending ? "Saving..." : "Save goals"}
      </button>
      {message ? <p className="success-note" style={{ margin: 0 }}>{message}</p> : null}
      {error ? <p className="error-note" style={{ margin: 0 }}>{error}</p> : null}
    </form>
  );
}
