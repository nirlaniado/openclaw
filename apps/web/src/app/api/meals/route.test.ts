import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  listMealsForDate: vi.fn(),
  logMeal: vi.fn(),
  formatDateInTimeZone: vi.fn()
}));

vi.mock("@/server/services/auth-service", () => ({
  requireUser: mocks.requireUser
}));

vi.mock("@/server/services/meal-log-service", () => ({
  listMealsForDate: mocks.listMealsForDate,
  logMeal: mocks.logMeal
}));

vi.mock("@/server/services/date-utils", () => ({
  formatDateInTimeZone: mocks.formatDateInTimeZone
}));

import { GET, POST } from "./route";

describe("api/meals route", () => {
  beforeEach(() => {
    mocks.requireUser.mockReset().mockResolvedValue({ id: "user-1" });
    mocks.listMealsForDate.mockReset();
    mocks.logMeal.mockReset();
    mocks.formatDateInTimeZone.mockReset().mockReturnValue("2026-06-18");
  });

  it("normalizes datetime-local POST input before handing it to the service", async () => {
    mocks.logMeal.mockResolvedValue({
      meal: { id: "meal-1" },
      summaryDate: "2026-06-18",
      warnings: []
    });

    const response = await POST(
      new Request("http://localhost/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eatenAt: "2026-06-18T08:30",
          timezone: "Asia/Hebron",
          mealText: "2 eggs, banana",
          mealType: "breakfast"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(mocks.logMeal).toHaveBeenCalledWith(
      { id: "user-1" },
      expect.objectContaining({
        eatenAt: "2026-06-18T08:30:00.000Z"
      })
    );
  });

  it("uses the timezone-derived date when GET does not receive one", async () => {
    mocks.listMealsForDate.mockResolvedValue([{ id: "meal-1" }]);

    const response = await GET(new Request("http://localhost/api/meals?timezone=Asia%2FHebron"));
    const payload = await response.json();

    expect(mocks.formatDateInTimeZone).toHaveBeenCalled();
    expect(mocks.listMealsForDate).toHaveBeenCalledWith({ id: "user-1" }, "2026-06-18", "Asia/Hebron");
    expect(payload).toEqual({ meals: [{ id: "meal-1" }] });
  });
});
