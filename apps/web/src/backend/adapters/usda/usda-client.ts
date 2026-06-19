import type { FoodLookupResult } from "@/backend/adapters/usda/types";
import { env } from "@/shared/config/env";
import { fallbackFoods } from "@/backend/adapters/usda/mock-foods";

type USDAFoodSearchResponse = {
  foods?: USDAFood[];
};

type USDAFood = {
  fdcId: number;
  description: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients?: Array<{
    nutrientId?: number;
    nutrientName?: string;
    value?: number;
  }>;
};

export interface USDANutritionClient {
  searchFoods(query: string): Promise<FoodLookupResult[]>;
  getFoodByFdcId(fdcId: number): Promise<FoodLookupResult | null>;
}

export class StubUSDANutritionClient implements USDANutritionClient {
  async searchFoods(_query: string): Promise<FoodLookupResult[]> {
    return [];
  }

  async getFoodByFdcId(_fdcId: number): Promise<FoodLookupResult | null> {
    return null;
  }
}

export class USDANutritionApiClient implements USDANutritionClient {
  constructor(private readonly apiKey: string) {}

  async searchFoods(query: string): Promise<FoodLookupResult[]> {
    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        pageSize: 5,
        dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"]
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`USDA search failed with status ${response.status}`);
    }

    const payload = (await response.json()) as USDAFoodSearchResponse;

    return (payload.foods ?? []).map(mapFood).filter(isCompleteLookup);
  }

  async getFoodByFdcId(fdcId: number): Promise<FoodLookupResult | null> {
    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${this.apiKey}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`USDA food lookup failed with status ${response.status}`);
    }

    const payload = (await response.json()) as USDAFood;
    const result = mapFood(payload);

    return isCompleteLookup(result) ? result : null;
  }
}

export function createUSDANutritionClient(): USDANutritionClient {
  if (env.USDA_API_KEY) {
    return new FallbackUSDANutritionClient(new USDANutritionApiClient(env.USDA_API_KEY));
  }

  return new LocalFoodFallbackClient();
}

class FallbackUSDANutritionClient implements USDANutritionClient {
  constructor(private readonly inner: USDANutritionClient) {}

  async searchFoods(query: string): Promise<FoodLookupResult[]> {
    try {
      const results = await this.inner.searchFoods(query);

      return results.length > 0 ? results : searchFallbackFoods(query);
    } catch {
      return searchFallbackFoods(query);
    }
  }

  async getFoodByFdcId(fdcId: number): Promise<FoodLookupResult | null> {
    try {
      const result = await this.inner.getFoodByFdcId(fdcId);

      return result ?? fallbackFoods.find((food) => food.fdcId === fdcId) ?? null;
    } catch {
      return fallbackFoods.find((food) => food.fdcId === fdcId) ?? null;
    }
  }
}

class LocalFoodFallbackClient implements USDANutritionClient {
  async searchFoods(query: string): Promise<FoodLookupResult[]> {
    return searchFallbackFoods(query);
  }

  async getFoodByFdcId(fdcId: number): Promise<FoodLookupResult | null> {
    return fallbackFoods.find((food) => food.fdcId === fdcId) ?? null;
  }
}

function mapFood(food: USDAFood): FoodLookupResult | null {
  const calories = findNutrient(food, [1008], ["Energy"]);
  const proteinGrams = findNutrient(food, [1003], ["Protein"]);
  const carbsGrams = findNutrient(food, [1005], ["Carbohydrate, by difference", "Carbohydrate"]);
  const fatGrams = findNutrient(food, [1004], ["Total lipid (fat)", "Total fat"]);

  if (calories === null || proteinGrams === null || carbsGrams === null || fatGrams === null) {
    return null;
  }

  const resolvedCalories = calories;
  const resolvedProteinGrams = proteinGrams;
  const resolvedCarbsGrams = carbsGrams;
  const resolvedFatGrams = fatGrams;

  const servingText =
    food.householdServingFullText ??
    (food.servingSize && food.servingSizeUnit ? `${food.servingSize} ${food.servingSizeUnit}` : "100 g");

  return {
    source: "usda",
    fdcId: food.fdcId,
    description: food.description,
    servingText,
    servingGrams: food.servingSize,
    totals: {
      calories: resolvedCalories,
      proteinGrams: resolvedProteinGrams,
      carbsGrams: resolvedCarbsGrams,
      fatGrams: resolvedFatGrams
    }
  };
}

function findNutrient(food: USDAFood, nutrientIds: number[], nutrientNames: string[]): number | null {
  const nutrient = food.foodNutrients?.find(
    (entry) =>
      (entry.nutrientId !== undefined && nutrientIds.includes(entry.nutrientId)) ||
      (entry.nutrientName !== undefined && nutrientNames.includes(entry.nutrientName))
  );

  return typeof nutrient?.value === "number" ? nutrient.value : null;
}

function isCompleteLookup(food: FoodLookupResult | null): food is FoodLookupResult {
  return food !== null;
}

function searchFallbackFoods(query: string): FoodLookupResult[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return fallbackFoods
    .map((food) => ({
      food,
      score: tokens.reduce((score, token) => score + (food.description.toLowerCase().includes(token) ? 1 : 0), 0)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map((entry) => entry.food);
}
