import type { FoodLookupResult } from "@/server/adapters/usda/types";

export const fallbackFoods: FoodLookupResult[] = [
  {
    source: "usda",
    fdcId: 9003,
    description: "Apple, raw",
    servingText: "1 medium (182 g)",
    servingGrams: 182,
    totals: {
      calories: 95,
      proteinGrams: 0.5,
      carbsGrams: 25.1,
      fatGrams: 0.3
    }
  },
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
  },
  {
    source: "usda",
    fdcId: 171688,
    description: "Chicken breast, roasted",
    servingText: "100 g",
    servingGrams: 100,
    totals: {
      calories: 165,
      proteinGrams: 31,
      carbsGrams: 0,
      fatGrams: 3.6
    }
  },
  {
    source: "usda",
    fdcId: 2346397,
    description: "Rice, white, cooked",
    servingText: "1 cup (158 g)",
    servingGrams: 158,
    totals: {
      calories: 205,
      proteinGrams: 4.3,
      carbsGrams: 44.5,
      fatGrams: 0.4
    }
  },
  {
    source: "usda",
    fdcId: 170379,
    description: "Broccoli, cooked",
    servingText: "1 cup chopped (156 g)",
    servingGrams: 156,
    totals: {
      calories: 55,
      proteinGrams: 3.7,
      carbsGrams: 11.2,
      fatGrams: 0.6
    }
  },
  {
    source: "usda",
    fdcId: 173944,
    description: "Greek yogurt, plain, nonfat",
    servingText: "1 container (170 g)",
    servingGrams: 170,
    totals: {
      calories: 100,
      proteinGrams: 17,
      carbsGrams: 6,
      fatGrams: 0
    }
  },
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
  },
  {
    source: "usda",
    fdcId: 169910,
    description: "Almonds",
    servingText: "1 oz (28 g)",
    servingGrams: 28,
    totals: {
      calories: 164,
      proteinGrams: 6,
      carbsGrams: 6.1,
      fatGrams: 14.2
    }
  }
];
