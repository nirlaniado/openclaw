import { describe, expect, it } from "vitest";
import { addDays, endOfMonth, endOfWeek, formatDateInTimeZone, listDatesInclusive, startOfMonth, startOfWeek } from "@/backend/services/date-utils";

describe("date-utils", () => {
  it("formats a date in a specific timezone", () => {
    expect(formatDateInTimeZone(new Date("2026-06-18T23:30:00.000Z"), "Asia/Hebron")).toBe("2026-06-19");
  });

  it("computes week and month boundaries", () => {
    expect(startOfWeek("2026-06-18")).toBe("2026-06-15");
    expect(endOfWeek("2026-06-18")).toBe("2026-06-21");
    expect(startOfMonth("2026-02-18")).toBe("2026-02-01");
    expect(endOfMonth("2026-02-18")).toBe("2026-02-28");
  });

  it("lists dates inclusively across boundaries", () => {
    expect(addDays("2026-06-18", 2)).toBe("2026-06-20");
    expect(listDatesInclusive("2026-06-18", "2026-06-20")).toEqual(["2026-06-18", "2026-06-19", "2026-06-20"]);
  });
});
