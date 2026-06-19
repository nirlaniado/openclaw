import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SummaryRangePanel } from "@/frontend/components/summary/summary-range-panel";

describe("frontend summary-range-panel", () => {
  it("renders the provided summary metrics and empty copy", () => {
    const markup = renderToStaticMarkup(
      createElement(SummaryRangePanel, {
        title: "Weekly Summary",
        description: "A persisted weekly summary",
        emptyCopy: "No meals yet.",
        summary: {
          range: "week",
          periodStart: "2026-06-15",
          periodEnd: "2026-06-21",
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
          },
          adherencePercent: 90,
          mealCount: 0,
          loggedDayCount: 0,
          totalDayCount: 7,
          days: [
            {
              date: "2026-06-15",
              consumed: {
                calories: 0,
                proteinGrams: 0,
                carbsGrams: 0,
                fatGrams: 0
              },
              target: {
                calories: 2000,
                proteinGrams: 160,
                carbsGrams: 200,
                fatGrams: 70
              },
              mealCount: 0,
              goalSetId: null,
              hasData: false
            }
          ]
        }
      })
    );

    expect(markup).toContain("Weekly Summary");
    expect(markup).toContain("2026-06-15 to 2026-06-21");
    expect(markup).toContain("1800/2000");
    expect(markup).toContain("No meals yet.");
  });
});
