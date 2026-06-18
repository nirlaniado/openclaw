"use client";

import { useState, useTransition } from "react";
import type { MealRecord, MealType } from "@/backend/contracts/meals";

type MealFormProps = {
  defaults: {
    eatenAt: string;
    timezone: string;
    locale: string;
    mealType: MealType;
  };
};

export function MealForm({ defaults }: MealFormProps) {
  const [form, setForm] = useState({
    eatenAt: defaults.eatenAt,
    timezone: defaults.timezone,
    locale: defaults.locale,
    mealType: defaults.mealType,
    mealText: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loggedMeal, setLoggedMeal] = useState<MealRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        setWarnings([]);
        setError(null);

        startTransition(async () => {
          const response = await fetch("/api/meals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
          });

          const result = (await response.json()) as { meal?: MealRecord; warnings?: string[]; error?: string };

          if (!response.ok || !result.meal) {
            setError(result.error ?? "Unable to log meal.");
            return;
          }

          setLoggedMeal(result.meal);
          setWarnings(result.warnings ?? []);
          setForm((current) => ({
            ...current,
            mealText: ""
          }));
          setMessage("Meal logged and daily summary recomputed.");
        });
      }}
      className="form-shell"
      style={{ marginTop: 24 }}
    >
      <div className="field-grid">
        <label className="field">
          <span>Meal type</span>
          <select
            value={form.mealType}
            onChange={(event) => setForm((current) => ({ ...current, mealType: event.target.value as MealType }))}
            className="field-control"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="field">
          <span>Eaten at</span>
          <input
            type="datetime-local"
            value={form.eatenAt}
            onChange={(event) => setForm((current) => ({ ...current, eatenAt: event.target.value }))}
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
      </div>
      <label className="field">
        <span>Meal description</span>
        <textarea
          value={form.mealText}
          onChange={(event) => setForm((current) => ({ ...current, mealText: event.target.value }))}
          placeholder="Example: 2 eggs, greek yogurt, banana"
          required
          rows={6}
          className="field-control textarea-control"
        />
      </label>
      <button type="submit" disabled={isPending} className="button">
        {isPending ? "Logging..." : "Log meal"}
      </button>
      {message ? <p className="success-note" style={{ margin: 0 }}>{message}</p> : null}
      {warnings.length > 0 ? (
        <div className="notice">
          <strong>Parser notes</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <p className="error-note" style={{ margin: 0 }}>{error}</p> : null}
      {loggedMeal ? (
        <section className="timeline-item">
          <div>
            <p className="eyebrow">
              Latest meal
            </p>
            <h2 style={{ margin: "8px 0 0" }}>{loggedMeal.mealType}</h2>
          </div>
          <p style={{ margin: 0, color: "var(--muted)" }}>{loggedMeal.mealText}</p>
          <div className="stack-sm">
            {loggedMeal.items.map((item) => (
              <div key={item.id} className="timeline-row">
                <div>
                  <strong>{item.description}</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>{item.quantityText ?? item.sourceRef}</p>
                </div>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {item.calories} kcal, {item.proteinGrams}p / {item.carbsGrams}c / {item.fatGrams}f
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </form>
  );
}
