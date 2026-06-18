"use client";

import { useState, useTransition } from "react";
import type { MealRecord, MealType } from "@/server/contracts/meals";

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
      style={{ display: "grid", gap: 18, marginTop: 24 }}
    >
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Meal type</span>
          <select
            value={form.mealType}
            onChange={(event) => setForm((current) => ({ ...current, mealType: event.target.value as MealType }))}
            style={fieldStyle}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Eaten at</span>
          <input
            type="datetime-local"
            value={form.eatenAt}
            onChange={(event) => setForm((current) => ({ ...current, eatenAt: event.target.value }))}
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
      </div>
      <label style={{ display: "grid", gap: 8 }}>
        <span>Meal description</span>
        <textarea
          value={form.mealText}
          onChange={(event) => setForm((current) => ({ ...current, mealText: event.target.value }))}
          placeholder="Example: 2 eggs, greek yogurt, banana"
          required
          rows={6}
          style={{ ...fieldStyle, resize: "vertical", minHeight: 140 }}
        />
      </label>
      <button type="submit" disabled={isPending} style={buttonStyle}>
        {isPending ? "Logging..." : "Log meal"}
      </button>
      {message ? <p style={{ margin: 0, color: "var(--accent-strong)" }}>{message}</p> : null}
      {warnings.length > 0 ? (
        <div style={noticeStyle}>
          <strong>Parser notes</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <p style={{ margin: 0, color: "#9f2d21" }}>{error}</p> : null}
      {loggedMeal ? (
        <section style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 18, display: "grid", gap: 12 }}>
          <div>
            <p style={{ margin: 0, color: "var(--warm)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Latest meal
            </p>
            <h2 style={{ margin: "8px 0 0" }}>{loggedMeal.mealType}</h2>
          </div>
          <p style={{ margin: 0, color: "var(--muted)" }}>{loggedMeal.mealText}</p>
          <div style={{ display: "grid", gap: 10 }}>
            {loggedMeal.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
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

const noticeStyle = {
  borderRadius: 16,
  padding: 16,
  background: "rgba(209, 127, 50, 0.12)",
  border: "1px solid rgba(209, 127, 50, 0.28)"
} as const;
