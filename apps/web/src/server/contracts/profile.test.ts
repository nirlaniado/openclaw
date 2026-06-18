import { describe, expect, it } from "vitest";
import { profileInputSchema } from "./profile";

describe("profileInputSchema", () => {
  it("accepts a complete profile payload", () => {
    const parsed = profileInputSchema.parse({
      displayName: "Nir",
      age: 33,
      sex: "male",
      heightCm: 182.5,
      weightKg: 79.4,
      timezone: "Asia/Hebron",
      preferredUnits: "metric"
    });

    expect(parsed.displayName).toBe("Nir");
    expect(parsed.preferredUnits).toBe("metric");
  });

  it("rejects underage profiles", () => {
    expect(() =>
      profileInputSchema.parse({
        displayName: "Kid",
        age: 12,
        sex: "other",
        heightCm: 140,
        weightKg: 40,
        timezone: "UTC",
        preferredUnits: "metric"
      })
    ).toThrow();
  });
});
