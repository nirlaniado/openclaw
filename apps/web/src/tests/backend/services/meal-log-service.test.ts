import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  llmAdapter: {
    parseMealText: vi.fn()
  },
  createUSDANutritionClient: vi.fn(),
  mealsRepository: {
    create: vi.fn(),
    listByUserAndDateRange: vi.fn(),
    listRecentByUser: vi.fn()
  },
  mealItemsRepository: {
    createMany: vi.fn(),
    listByMealIds: vi.fn()
  },
  dailySummariesRepository: {
    upsert: vi.fn()
  },
  getOrCreateProfile: vi.fn(),
  getActiveGoalSet: vi.fn()
}));

vi.mock("@/backend/lib/supabase-server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient
}));

vi.mock("@/backend/adapters/ollama/llm-adapter", () => ({
  NoopLLMAdapter: class {
    constructor() {
      return mocks.llmAdapter;
    }
  }
}));

vi.mock("@/backend/adapters/usda/usda-client", () => ({
  createUSDANutritionClient: mocks.createUSDANutritionClient
}));

vi.mock("@/backend/repositories/meals-repository", () => ({
  MealsRepository: class {
    constructor() {
      return mocks.mealsRepository;
    }
  }
}));

vi.mock("@/backend/repositories/meal-items-repository", () => ({
  MealItemsRepository: class {
    constructor() {
      return mocks.mealItemsRepository;
    }
  }
}));

vi.mock("@/backend/repositories/daily-summaries-repository", () => ({
  DailySummariesRepository: class {
    constructor() {
      return mocks.dailySummariesRepository;
    }
  }
}));

vi.mock("@/backend/services/profile-service", () => ({
  getOrCreateProfile: mocks.getOrCreateProfile
}));

vi.mock("@/backend/services/goals-service", () => ({
  getActiveGoalSet: mocks.getActiveGoalSet
}));

import { logMeal, recomputeDailySummary } from "@/backend/services/meal-log-service";

describe("meal-log-service", () => {
  const user = {
    id: "eb3f1db6-48c9-4637-b7b4-53be87104916"
  } as User;

  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset().mockResolvedValue({});
    mocks.getOrCreateProfile.mockReset().mockResolvedValue({});
    mocks.getActiveGoalSet.mockReset().mockResolvedValue({ id: "goal-1" });
    mocks.llmAdapter.parseMealText.mockReset().mockResolvedValue({
      originalText: "2 eggs, banana",
      parseStrategy: "noop",
      warnings: ["LLM parsing is not enabled in this environment."],
      items: []
    });
    mocks.createUSDANutritionClient.mockReset().mockReturnValue({
      searchFoods: vi.fn(async (query: string) => {
        if (query === "eggs") {
          return [
            {
              source: "usda",
              fdcId: 1123,
              description: "Egg, whole, cooked",
              servingText: "1 large (50 g)",
              servingGrams: 50,
              totals: {
                calories: 78,
                proteinGrams: 6.3,
                carbsGrams: 0.6,
                fatGrams: 5.3
              }
            }
          ];
        }

        return [
          {
            source: "usda",
            fdcId: 174697,
            description: "Banana, raw",
            servingText: "1 medium (118 g)",
            servingGrams: 118,
            totals: {
              calories: 105,
              proteinGrams: 1.3,
              carbsGrams: 27,
              fatGrams: 0.4
            }
          }
        ];
      })
    });
    mocks.mealsRepository.create.mockReset().mockResolvedValue({
      id: "meal-1",
      userId: user.id,
      mealType: "breakfast",
      source: "manual",
      mealText: "2 eggs, banana",
      status: "logged",
      eatenAt: "2026-06-18T08:30:00.000Z",
      loggedAt: "2026-06-18T08:31:00.000Z",
      createdAt: "2026-06-18T08:31:00.000Z",
      updatedAt: "2026-06-18T08:31:00.000Z"
    });
    mocks.mealsRepository.listByUserAndDateRange.mockReset().mockResolvedValue([
      {
        id: "meal-1"
      }
    ]);
    mocks.mealItemsRepository.createMany.mockReset().mockResolvedValue([
      {
        id: "item-1",
        mealId: "meal-1",
        source: "usda",
        sourceRef: "1123",
        description: "Egg, whole, cooked",
        quantityText: "2",
        grams: 50,
        calories: 78,
        proteinGrams: 6.3,
        carbsGrams: 0.6,
        fatGrams: 5.3,
        createdAt: "2026-06-18T08:31:00.000Z"
      },
      {
        id: "item-2",
        mealId: "meal-1",
        source: "usda",
        sourceRef: "174697",
        description: "Banana, raw",
        quantityText: null,
        grams: 118,
        calories: 105,
        proteinGrams: 1.3,
        carbsGrams: 27,
        fatGrams: 0.4,
        createdAt: "2026-06-18T08:31:00.000Z"
      }
    ]);
    mocks.mealItemsRepository.listByMealIds.mockReset().mockResolvedValue([
      {
        id: "item-1",
        mealId: "meal-1",
        calories: 78,
        proteinGrams: 6.3,
        carbsGrams: 0.6,
        fatGrams: 5.3
      },
      {
        id: "item-2",
        mealId: "meal-1",
        calories: 105,
        proteinGrams: 1.3,
        carbsGrams: 27,
        fatGrams: 0.4
      }
    ]);
    mocks.dailySummariesRepository.upsert.mockReset().mockResolvedValue({
      id: "summary-1"
    });
  });

  it("logs a meal, resolves food items, and recomputes the daily summary", async () => {
    const result = await logMeal(user, {
      eatenAt: "2026-06-18T08:30:00.000Z",
      timezone: "Asia/Hebron",
      mealText: "2 eggs, banana",
      mealType: "breakfast"
    });

    expect(mocks.mealsRepository.create).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({
        mealText: "2 eggs, banana",
        mealType: "breakfast"
      }),
      "logged"
    );
    expect(mocks.mealItemsRepository.createMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          mealId: "meal-1",
          description: "Egg, whole, cooked"
        }),
        expect.objectContaining({
          mealId: "meal-1",
          description: "Banana, raw"
        })
      ])
    );
    expect(mocks.dailySummariesRepository.upsert).toHaveBeenCalledWith(
      user.id,
      "2026-06-18",
      "goal-1",
      {
        calories: 183,
        proteinGrams: 7.6,
        carbsGrams: 27.6,
        fatGrams: 5.7
      },
      1
    );
    expect(result.summaryDate).toBe("2026-06-18");
    expect(result.warnings).toEqual(["LLM parsing is not enabled in this environment."]);
  });

  it("recomputes summary totals from persisted meal items", async () => {
    await recomputeDailySummary(user, "2026-06-18", "Asia/Hebron");

    expect(mocks.mealsRepository.listByUserAndDateRange).toHaveBeenCalledWith(user.id, "2026-06-18", "2026-06-19");
    expect(mocks.dailySummariesRepository.upsert).toHaveBeenCalledWith(
      user.id,
      "2026-06-18",
      "goal-1",
      {
        calories: 183,
        proteinGrams: 7.6,
        carbsGrams: 27.6,
        fatGrams: 5.7
      },
      1
    );
  });
});
