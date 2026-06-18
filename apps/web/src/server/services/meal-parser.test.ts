import { describe, expect, it } from "vitest";
import { parseMealTextDeterministically } from "./meal-parser";

describe("parseMealTextDeterministically", () => {
  it("splits a plain-language meal into candidate items", () => {
    const parsed = parseMealTextDeterministically("2 eggs, greek yogurt and banana");

    expect(parsed.parseStrategy).toBe("heuristic");
    expect(parsed.items).toEqual([
      { description: "eggs", quantityText: "2", confidence: "medium" },
      { description: "greek yogurt", confidence: "medium" },
      { description: "banana", confidence: "medium" }
    ]);
  });

  it("returns a warning for empty structure", () => {
    const parsed = parseMealTextDeterministically("   ");

    expect(parsed.items).toHaveLength(0);
    expect(parsed.warnings[0]).toMatch(/No structured meal items/);
  });
});
