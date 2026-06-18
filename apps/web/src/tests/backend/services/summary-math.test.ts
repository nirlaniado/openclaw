import { describe, expect, it } from "vitest";
import { buildSummaryRange, createEmptySummaryDay } from "@/backend/services/summary-math";

describe("buildSummaryRange", () => {
  it("aggregates daily snapshots into a range summary", () => {
    const summary = buildSummaryRange("week", "2026-06-15", "2026-06-21", [
      {
        ...createEmptySummaryDay("2026-06-15", null),
        hasData: true,
        mealCount: 2,
        consumed: {
          calories: 1800,
          proteinGrams: 140,
          carbsGrams: 150,
          fatGrams: 60
        },
        target: {
          calories: 2000,
          proteinGrams: 160,
          carbsGrams: 200,
          fatGrams: 70
        }
      },
      {
        ...createEmptySummaryDay("2026-06-16", null),
        target: {
          calories: 2000,
          proteinGrams: 160,
          carbsGrams: 200,
          fatGrams: 70
        }
      }
    ]);

    expect(summary.mealCount).toBe(2);
    expect(summary.loggedDayCount).toBe(1);
    expect(summary.consumed.calories).toBe(1800);
    expect(summary.target.calories).toBe(4000);
    expect(summary.adherencePercent).toBe(45);
  });
});
