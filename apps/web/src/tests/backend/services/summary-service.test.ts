import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  dailySummariesRepository: {
    listByUserAndDateRange: vi.fn()
  },
  goalSetsRepository: {
    findActiveForDate: vi.fn()
  }
}));

vi.mock("@/backend/lib/supabase-server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient
}));

vi.mock("@/backend/repositories/daily-summaries-repository", () => ({
  DailySummariesRepository: class {
    constructor() {
      return mocks.dailySummariesRepository;
    }
  }
}));

vi.mock("@/backend/repositories/goal-sets-repository", () => ({
  GoalSetsRepository: class {
    constructor() {
      return mocks.goalSetsRepository;
    }
  }
}));

import { getMonthlySummary, getWeeklySummary } from "@/backend/services/summary-service";

describe("summary-service", () => {
  const user = {
    id: "d10ca6f4-7614-44e3-8c17-59f897fa0d72"
  } as User;

  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset().mockResolvedValue({});
    mocks.dailySummariesRepository.listByUserAndDateRange.mockReset();
    mocks.goalSetsRepository.findActiveForDate.mockReset();
  });

  it("fills missing weekly days with empty snapshots while preserving targets", async () => {
    mocks.dailySummariesRepository.listByUserAndDateRange.mockResolvedValue([
      {
        summaryDate: "2026-06-15",
        goalSetId: "goal-1",
        consumed: {
          calories: 1800,
          proteinGrams: 140,
          carbsGrams: 160,
          fatGrams: 60
        },
        mealCount: 2
      }
    ]);
    mocks.goalSetsRepository.findActiveForDate.mockImplementation(async (_userId: string, date: string) => ({
      id: date === "2026-06-15" ? "goal-1" : "goal-2",
      calorieTarget: date === "2026-06-15" ? 2000 : 2100,
      proteinGramsTarget: 160,
      carbsGramsTarget: 200,
      fatGramsTarget: 70
    }));

    const summary = await getWeeklySummary(user, "2026-06-18");

    expect(summary.periodStart).toBe("2026-06-15");
    expect(summary.periodEnd).toBe("2026-06-21");
    expect(summary.days).toHaveLength(7);
    expect(summary.days[0]?.hasData).toBe(true);
    expect(summary.days[1]?.hasData).toBe(false);
    expect(summary.days[1]?.target.calories).toBe(2100);
  });

  it("builds a monthly summary over the full month boundary", async () => {
    mocks.dailySummariesRepository.listByUserAndDateRange.mockResolvedValue([]);
    mocks.goalSetsRepository.findActiveForDate.mockResolvedValue(null);

    const summary = await getMonthlySummary(user, "2026-02-18");

    expect(summary.periodStart).toBe("2026-02-01");
    expect(summary.periodEnd).toBe("2026-02-28");
    expect(summary.totalDayCount).toBe(28);
    expect(summary.mealCount).toBe(0);
  });
});
