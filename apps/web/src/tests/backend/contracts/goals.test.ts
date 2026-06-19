import { describe, expect, it } from "vitest";
import { goalsInputSchema } from "@/backend/contracts/goals";

describe("goalsInputSchema", () => {
  it("accepts a valid goal set", () => {
    const parsed = goalsInputSchema.parse({
      calorieTarget: 2200,
      proteinGramsTarget: 160,
      carbsGramsTarget: 210,
      fatGramsTarget: 70,
      effectiveFrom: "2026-06-18"
    });

    expect(parsed.calorieTarget).toBe(2200);
  });

  it("rejects a malformed effective date", () => {
    expect(() =>
      goalsInputSchema.parse({
        calorieTarget: 2200,
        proteinGramsTarget: 160,
        carbsGramsTarget: 210,
        fatGramsTarget: 70,
        effectiveFrom: "06/18/2026"
      })
    ).toThrow();
  });
});
