import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/backend/lib/supabase-server";
import { NoopLLMAdapter } from "@/backend/adapters/ollama/llm-adapter";
import { createUSDANutritionClient } from "@/backend/adapters/usda/usda-client";
import { type MealCreateInput, mealCreateSchema, type MealRecord } from "@/backend/contracts/meals";
import { getActiveGoalSet } from "@/backend/services/goals-service";
import { MealItemsRepository } from "@/backend/repositories/meal-items-repository";
import { MealsRepository } from "@/backend/repositories/meals-repository";
import { DailySummariesRepository } from "@/backend/repositories/daily-summaries-repository";
import { getOrCreateProfile } from "@/backend/services/profile-service";
import { formatDateInTimeZone, addDays } from "@/backend/services/date-utils";
import { parseMealTextDeterministically } from "@/backend/services/meal-parser";
import { addMacroTotals, emptyMacroTotals } from "@/backend/services/summary-math";

type LoggedMealResult = {
  meal: MealRecord;
  summaryDate: string;
  warnings: string[];
};

const llmAdapter = new NoopLLMAdapter();

export async function logMeal(user: User, input: MealCreateInput): Promise<LoggedMealResult> {
  const validated = mealCreateSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const mealsRepository = new MealsRepository(supabase);
  const mealItemsRepository = new MealItemsRepository(supabase);

  await getOrCreateProfile(user);

  const parsedFromLlm = await llmAdapter.parseMealText({
    mealText: validated.mealText,
    timezone: validated.timezone,
    locale: validated.locale,
    mealType: validated.mealType,
    eatenAt: validated.eatenAt,
    maxCandidates: 8
  });
  const parsed = parsedFromLlm.items.length > 0 ? parsedFromLlm : parseMealTextDeterministically(validated.mealText);
  const nutritionClient = createUSDANutritionClient();
  const resolvedItems = await Promise.all(
    parsed.items.map(async (item) => {
      const [firstMatch] = await nutritionClient.searchFoods(item.description);

      if (!firstMatch) {
        throw new Error(`No USDA match found for "${item.description}".`);
      }

      return {
        source: firstMatch.source,
        sourceRef: String(firstMatch.fdcId),
        description: firstMatch.description,
        quantityText: item.quantityText,
        grams: firstMatch.servingGrams,
        calories: firstMatch.totals.calories,
        proteinGrams: firstMatch.totals.proteinGrams,
        carbsGrams: firstMatch.totals.carbsGrams,
        fatGrams: firstMatch.totals.fatGrams
      };
    })
  );

  if (resolvedItems.length === 0) {
    throw new Error("Meal text could not be parsed into any food items.");
  }

  const meal = await mealsRepository.create(user.id, validated, "logged");
  const items = await mealItemsRepository.createMany(
    resolvedItems.map((item) => ({
      mealId: meal.id,
      ...item
    }))
  );

  const summaryDate = formatDateInTimeZone(new Date(validated.eatenAt), validated.timezone);
  await recomputeDailySummary(user, summaryDate, validated.timezone);

  return {
    meal: {
      ...meal,
      items
    },
    summaryDate,
    warnings: parsedFromLlm.warnings
  };
}

export async function listMealsForDate(user: User, date: string, timezone: string): Promise<MealRecord[]> {
  const supabase = await createSupabaseServerClient();
  const mealsRepository = new MealsRepository(supabase);
  const mealItemsRepository = new MealItemsRepository(supabase);
  const startDate = date;
  const endDateExclusive = addDays(date, 1);
  const meals = await mealsRepository.listByUserAndDateRange(user.id, startDate, endDateExclusive);
  const items = await mealItemsRepository.listByMealIds(meals.map((meal) => meal.id));
  const itemsByMealId = new Map<string, MealRecord["items"]>();

  for (const item of items) {
    const existing = itemsByMealId.get(item.mealId) ?? [];
    existing.push(item);
    itemsByMealId.set(item.mealId, existing);
  }

  return meals.map((meal) => ({
    ...meal,
    items: itemsByMealId.get(meal.id) ?? []
  }));
}

export async function listRecentMeals(user: User, limit = 6): Promise<MealRecord[]> {
  const supabase = await createSupabaseServerClient();
  const mealsRepository = new MealsRepository(supabase);
  const mealItemsRepository = new MealItemsRepository(supabase);
  const meals = await mealsRepository.listRecentByUser(user.id, limit);
  const items = await mealItemsRepository.listByMealIds(meals.map((meal) => meal.id));
  const itemsByMealId = new Map<string, MealRecord["items"]>();

  for (const item of items) {
    const existing = itemsByMealId.get(item.mealId) ?? [];
    existing.push(item);
    itemsByMealId.set(item.mealId, existing);
  }

  return meals.map((meal) => ({
    ...meal,
    items: itemsByMealId.get(meal.id) ?? []
  }));
}

export async function recomputeDailySummary(user: User, summaryDate: string, timezone: string) {
  const supabase = await createSupabaseServerClient();
  const mealsRepository = new MealsRepository(supabase);
  const mealItemsRepository = new MealItemsRepository(supabase);
  const dailySummariesRepository = new DailySummariesRepository(supabase);
  const meals = await mealsRepository.listByUserAndDateRange(user.id, summaryDate, addDays(summaryDate, 1));
  const items = await mealItemsRepository.listByMealIds(meals.map((meal) => meal.id));
  const consumed = items.reduce(
    (total, item) =>
      addMacroTotals(total, {
        calories: item.calories,
        proteinGrams: item.proteinGrams,
        carbsGrams: item.carbsGrams,
        fatGrams: item.fatGrams
      }),
    emptyMacroTotals()
  );
  const goalSet = await getActiveGoalSet(user, summaryDate);

  return dailySummariesRepository.upsert(user.id, summaryDate, goalSet?.id ?? null, consumed, meals.length);
}

export function buildMealFormDefaults(timezone: string) {
  return {
    timezone,
    mealType: "other" as const,
    eatenAt: new Date().toISOString().slice(0, 16),
    locale: "en-US"
  };
}
